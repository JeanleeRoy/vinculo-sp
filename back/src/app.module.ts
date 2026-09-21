import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration, { AppConfig } from './config/configuration';
import { HealthModule } from './modules/health/health.module';
import { MessagesModule } from './modules/messages/messages.module';
import { MessageOrmEntity } from './modules/messages/infrastructure/persistence/message.orm-entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const appConfig = configService.get<AppConfig>('app');
        return [
          {
            ttl: appConfig?.throttleTtl ?? 60000,
            limit: appConfig?.throttleLimit ?? 100,
          },
        ];
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const appConfig = configService.get<AppConfig>('app');
        const dbConfig = appConfig?.database;

        if (dbConfig?.type === 'sqlite') {
          return {
            type: 'sqlite',
            database: 'vinculo.sqlite',
            entities: [MessageOrmEntity],
            synchronize: true,
            logging: appConfig?.nodeEnv === 'development',
          };
        }

        // Supabase / PostgreSQL configuration
        const isSslEnabled = dbConfig?.ssl ?? true;
        const sslOptions = isSslEnabled ? { rejectUnauthorized: false } : false;

        if (dbConfig?.url) {
          return {
            type: 'postgres',
            url: dbConfig.url,
            entities: [MessageOrmEntity],
            synchronize: true, // Auto-create tables for development/prototyping
            ssl: sslOptions,
            logging: appConfig?.nodeEnv === 'development',
          };
        }

        return {
          type: 'postgres',
          host: dbConfig?.host ?? 'localhost',
          port: dbConfig?.port ?? 5432,
          username: dbConfig?.username ?? 'postgres',
          password: dbConfig?.password ?? '',
          database: dbConfig?.database ?? 'vinculo-db',
          entities: [MessageOrmEntity],
          synchronize: true, // Auto-create tables for development/prototyping
          ssl: sslOptions,
          logging: appConfig?.nodeEnv === 'development',
        };
      },
    }),
    HealthModule,
    MessagesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
