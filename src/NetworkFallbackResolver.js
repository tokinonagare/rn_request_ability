let networkFallbackResolver = async () => undefined;

export function setNetworkFallbackResolver(resolver) {
    networkFallbackResolver = typeof resolver === 'function'
        ? resolver
        : async () => undefined;
}

export function getNetworkFallbackResolver() {
    return networkFallbackResolver;
}
