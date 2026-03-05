export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    const path = event.context.params?.path?.join("/") || ""

    const targetUrl = `${config.public.apiBaseUrl}/${path}`

    // Forward method, headers, and body
    return await proxyRequest(event, targetUrl, {
        fetchOptions: {
            headers: {
                ...getRequestHeaders(event),
            },
        },
    })
})