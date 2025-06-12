import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class SettingsService {
    constructor(private configService: ConfigService) {
    }

    getDatabaseHost(): string | undefined {
        return this.configService.get<string>('DB_HOST');
    }

    getApiKey(): string {
        return this.configService.get<string>("API_KEY", "default-api-key")
    }
    
    getKeyValue<T>(key:string): T | undefined{
        return this.configService.get<T>(key);
    }

}