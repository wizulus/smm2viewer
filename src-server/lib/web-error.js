export default class WebError extends Error {
  constructor (statusCode, message, body = null) {
    super()
    this.statusCode = statusCode
    this.message = message
    this.body = body
  }

  withBody (body) {
    return new this.constructor(this.statusCode, this.message, body)
  }

  withMessage (message) {
    return new this.constructor(this.statusCode, message, this.body)
  }
}

export const badRequest = new WebError(400, 'Bad Request')
export const unauthorized = new WebError(401, 'Unauthorized')
export const paymentRequired = new WebError(402, 'Payment Required')
export const forbidden = new WebError(403, 'Forbidden')
export const notFound = new WebError(404, 'Not Found')
export const methodNotAllowed = new WebError(405, 'Method Not Allowed')
export const notAcceptable = new WebError(406, 'Not Acceptable')
export const proxyAuthenticationRequired = new WebError(407, 'Proxy Authentication Required')
export const requestTimeout = new WebError(408, 'Request Timeout')
export const conflict = new WebError(409, 'Conflict')
export const gone = new WebError(410, 'Gone')
export const lengthRequired = new WebError(411, 'Length Required')
export const preconditionFailed = new WebError(412, 'Precondition Failed')
export const requestEntityTooLarge = new WebError(413, 'Request Entity Too Large')
export const requestUriTooLong = new WebError(414, 'Request-URI Too Long')
export const unsupportedMediaType = new WebError(415, 'Unsupported Media Type')
export const requestedRangeNotSatisfiable = new WebError(416, 'Requested Range Not Satisfiable')
export const expectationFailed = new WebError(417, 'Expectation Failed')
// (RFC 2324) http://tools.ietf.org/html/rfc2324
// https://stackoverflow.com/questions/52340027/is-418-im-a-teapot-really-an-http-response-code/56189743
export const imATeapot = new WebError(418, 'I\'m a Teapot')
// Returned by the Twitter Search and Trends API when the client is being rate limited
export const enhanceYourCalm = new WebError(420, 'Enhance Your Calm')
// (WebDAV) (RFC 4918)
export const unprocessableEntity = new WebError(422, 'Unprocessable Entity')
// (WebDAV) (RFC 4918)
export const locked = new WebError(423, 'Locked')
// (WebDAV) (RFC 4918)
export const failedDependency = new WebError(424, 'Failed Dependency')
// (RFC 3648)
export const unorderedCollection = new WebError(425, 'Unordered Collection')
// (RFC 2817)
export const upgradeRequired = new WebError(426, 'Upgrade Required')
export const preconditionRequired = new WebError(428, 'Precondition Required')
// Used for rate limiting
export const tooManyRequests = new WebError(429, 'Too Many Requests')
export const requestHeaderFieldsTooLarge = new WebError(431, 'Request Header Fields Too Large')
// An nginx HTTP server extension. The server returns no information to the client and closes the connection (useful as a deterrent for malware).
export const noResponse = new WebError(444, 'No Response')
// A Microsoft extension. The request should be retried after performing the appropriate action.
export const retryWith = new WebError(449, 'Retry With')
export const blockedByWindowsParentalControls = new WebError(450, 'Blocked By Windows Parental Controls')
export const unavailableForLegalReasons = new WebError(451, 'Unavailable For Legal Reasons')
export const clientClosedRequest = new WebError(499, 'Client Closed Request')
export const internalServerError = new WebError(500, 'Internal Server Error')
export const notImplemented = new WebError(501, 'Not Implemented')
export const badGateway = new WebError(502, 'Bad Gateway')
export const serviceUnavailable = new WebError(503, 'Service Unavailable')
export const gatewayTimeout = new WebError(504, 'Gateway Timeout')
export const httpVersionNotSupported = new WebError(505, 'HTTP Version Not Supported')
export const variantAlsoNegotiates = new WebError(506, 'Variant Also Negotiates')
export const insufficientStorage = new WebError(507, 'Insufficient Storage')
export const loopDetected = new WebError(508, 'Loop Detected')
export const bandwidthLimitExceeded = new WebError(509, 'Bandwidth Limit Exceeded')
export const notExtended = new WebError(510, 'Not Extended')
export const networkAuthenticationRequired = new WebError(511, 'Network Authentication Required')
