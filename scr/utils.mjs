export function devLog(...args) {
    if (process.env.ENV === 'dev' || process.env.ENV === 'test') {
        console.log('[DEV]', ...args);
    }
}
