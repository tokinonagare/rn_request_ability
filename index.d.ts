import { AxiosResponse, Method } from 'axios';

interface Header extends Record<string, string> {
    'Content-Type': string;
    'APP-ID': string;
    'Accept-Language': string;
}
interface AuthHeader extends Header {
    Authorization: string;
}

export declare class RequestAbilityHeaderFactory {
    #header: Header;

    constructor(props: { appId: string; sysLanguage: string, appVersion: string });

    authorizedHeader(auth: string): AuthHeader;

    unauthorizedHeader(): Header;
}

export declare class RequestAbility {
    static DEFAULT_TIMEOUT: number;

    accessToken: string;

    headerFactory: RequestAbilityHeaderFactory;

    apiDomain: string;

    constructor(apiDomain: string, accessToken: string, headerFactory: RequestAbilityHeaderFactory);

    setApiDomain(apiDomain: string): void;

    setAccessToken(accessToken: string): void;

    private _request(method: Method, { path, header, body, timeout }: { path: string; header: Record<string, string>; body?: Record<string, any>; timeout: number | undefined }): Promise<any>;

    protected post(path: string, header: Record<string, string>, body?: Record<string, any>, timeout?: number): Promise<any>;

    protected get(path: string, header: Record<string, string>, timeout?: number): Promise<any>;

    protected put(path: string, header: Record<string, string>, body?: Record<string, any>, timeout?: number): Promise<any>;

    protected delete(path: string, header: Record<string, string>, body?: Record<string, any>, timeout?: number): Promise<any>;

    protected patch(path: string, header: Record<string, string>, body?: Record<string, any>, timeout?: number): Promise<any>;
}

export declare class DeserializeRequestAbility extends RequestAbility {
    protected get(path: string, header: Record<string, string>, timeout?: number): Promise<any>;

    protected post(path: string, header: Record<string, string>, body?: Record<string, any>, timeout?: number): Promise<any>;

    protected put(path: string, header: Record<string, string>, body?: Record<string, any>, timeout?: number): Promise<any>;

    protected delete(path: string, header: Record<string, string>, body?: Record<string, any>, timeout?: number): Promise<any>;

    protected patch(path: string, header: Record<string, string>, body?: Record<string, any>, timeout?: number): Promise<any>;
}

export declare class LoggerRequestAbility extends RequestAbility {
    protected get(path: string, header: Record<string, string>, timeout?: number): Promise<any>;

    protected post(path: string, header: Record<string, string>, body?: Record<string, any>, timeout?: number): Promise<any>;

    protected put(path: string, header: Record<string, string>, body?: Record<string, any>, timeout?: number): Promise<any>;

    protected delete(path: string, header: Record<string, string>, body?: Record<string, any>, timeout?: number): Promise<any>;

    protected patch(path: string, header: Record<string, string>, body?: Record<string, any>, timeout?: number): Promise<any>;
}

export declare class ResponseError extends Error {
    constructor(message: string, type: string, path: string, response: AxiosResponse);
}

export declare function setNetworkFallbackResolver(
    resolver?: (currentApiDomain: string) => Promise<string | undefined>,
): void;
