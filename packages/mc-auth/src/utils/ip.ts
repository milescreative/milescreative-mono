export function getClientIp(req: Request): string | undefined {
    // Try headers in order of priority
    const headersToCheck = [
        'X-Client-IP',
        'X-Forwarded-For',
        'CF-Connecting-IP',
        'Fastly-Client-Ip',
        'True-Client-Ip',
        'X-Real-IP',
        'X-Cluster-Client-IP',
        'X-Forwarded',
        'Forwarded-For',
        'Forwarded'
    ];

    for (const header of headersToCheck) {
        const value = req.headers.get(header.toLowerCase());
        if (value) {
            return value.split(',')?.[0]?.trim();
        }
    }

    // If no IP is found, return undefined
    return undefined;
}

// Example usage:
// const ip = getClientIp(req);
// console.log(ip);
