/**
 * Copyright (c) 2018-present, AC, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * author：Mark
 * date：  2021/9/15 11:09 AM
 */
import axios from 'axios';
import ResponseError from './ResponseError';
import parseResponseErrorMessage from './parseResponseErrorMessage';
import parseResponseErrorType from './parseResponseErrorType';
import { getNetworkFallbackResolver } from './NetworkFallbackResolver';
export default class RequestAbility {
    static DEFAULT_TIMEOUT = 10000;

    accessToken;

    headerFactory;

    apiDomain;

    constructor(apiDomain, accessToken, headerFactory) {
        if (!apiDomain) {
            throw new Error('Please specify an apiDomain');
        }
        this.apiDomain = apiDomain;
        if (accessToken) {
            this.accessToken = accessToken;
        }
        if (headerFactory) {
            this.headerFactory = headerFactory;
        }
    }

    setApiDomain(apiDomain) {
        this.apiDomain = apiDomain;
    }

    setAccessToken(accessToken) {
        this.accessToken = accessToken;
    }

    post(path, header, body, timeout = RequestAbility.DEFAULT_TIMEOUT) {
        return this._request('post', { path, header, body, timeout });
    }

    get(path, header, timeout = RequestAbility.DEFAULT_TIMEOUT) {
        return this._request('get', { path, header, timeout });
    }

    put(path, header, body, timeout = RequestAbility.DEFAULT_TIMEOUT) {
        return this._request('put', { path, header, body, timeout });
    }

    delete(path, header, body, timeout = RequestAbility.DEFAULT_TIMEOUT) {
        return this._request('delete', { path, header, body, timeout });
    }

    patch(path, header, body, timeout = RequestAbility.DEFAULT_TIMEOUT) {
        return this._request('patch', { path, header, body, timeout });
    }

    static _buildNetworkDebugInfo(error, axiosConfig, path, hasRetried) {
        const { response, request } = error || {};
        const requestUrl = `${axiosConfig.baseURL || ''}${path}`;
        return {
            requestUrl,
            baseURL: axiosConfig.baseURL || '',
            path,
            method: axiosConfig.method,
            timeout: axiosConfig.timeout,
            message: error?.message,
            code: error?.code || 'no-code',
            status: response?.status,
            responseURL: response?.request?.responseURL
                || request?.responseURL
                || request?._responseURL
                || 'n/a',
            readyState: request?.readyState,
            hasResponse: Boolean(response),
            hasRequest: Boolean(request),
            retried: hasRetried,
        };
    }

    _request(method, {
        path,
        header,
        body,
        timeout,
        hasRetried = false,
    }) {
        const axiosConfig = {
            baseURL: this.apiDomain,
            method,
            url: path,
            timeout,
        };
        if (body) {
            axiosConfig.data = body;
        }
        if (header) {
            axiosConfig.headers = header;
        }
        return axios(axiosConfig)
            .then((res) => {
                const { data } = res;
                const { ok, result } = data;
                if (ok) {
                    return result;
                }
                throw new ResponseError(parseResponseErrorMessage(res), parseResponseErrorType(res), path, res);
            })
            .catch((error) => {
                if (error instanceof ResponseError) {
                    throw error;
                } else if (error.code === 'ECONNABORTED') {
                    throw new ResponseError(error.message, 'timeout', path);
                } else {
                    const { response } = error;
                    const requestUrl = `${axiosConfig.baseURL || ''}${path}`;
                    const debugInfo = RequestAbility._buildNetworkDebugInfo(error, axiosConfig, path, hasRetried);
                    const networkFallbackResolver = getNetworkFallbackResolver();
                    if (!hasRetried
                        && error.message === 'Network Error') {
                        console.warn(`[RequestAbility] network error detail ${JSON.stringify(debugInfo)}`);
                        return networkFallbackResolver(this.apiDomain)
                            .then((nextApiDomain) => {
                                if (!nextApiDomain || nextApiDomain === this.apiDomain) {
                                    throw error;
                                }
                                console.warn(`[RequestAbility] retry ${requestUrl} with ${nextApiDomain}`);
                                this.setApiDomain(nextApiDomain);
                                return this._request(method, {
                                    path,
                                    header,
                                    body,
                                    timeout,
                                    hasRetried: true,
                                });
                            })
                            .catch((retryError) => {
                                const retryDebugInfo = RequestAbility._buildNetworkDebugInfo(
                                    retryError,
                                    {
                                        ...axiosConfig,
                                        baseURL: this.apiDomain,
                                    },
                                    path,
                                    true,
                                );
                                console.warn(`[RequestAbility] retry failed ${JSON.stringify(retryDebugInfo)}`);
                                const fallbackError = retryError === error
                                    ? retryError
                                    : new ResponseError(
                                        retryError.message || error.message,
                                        'axios_catch_error',
                                        path,
                                        response,
                                    );
                                throw fallbackError;
                            });
                    }
                    console.warn(`[RequestAbility] network error ${requestUrl} ${error.message} ${error.code || 'no-code'}`);
                    console.warn(`[RequestAbility] network error detail ${JSON.stringify(debugInfo)}`);
                    throw new ResponseError(error.message, 'axios_catch_error', path, response);
                }
            });
    }
}
