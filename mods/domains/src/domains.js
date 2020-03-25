const { logger } = require('@yaps/core')
const { AbstractService, DomainsService, DomainsPB } = require('@yaps/core')
const promisifyAll = require('grpc-promise').promisifyAll

/**
 * @classdesc Use YAPS Domains, a capability of YAPS SIP Proxy Subsystem,
 * to create, update,  get and delete domains. YAPS Domains requires of a
 * running YAPS deployment.
 *
 * @extends AbstractService
 * @example
 *
 * const YAPS = require('@yaps/sdk')
 * const domains = new YAPS.Domains()
 *
 * domains.create({name: 'Local Domain', domainUri: 'sip.local'...})
 * .then(result => {
 *   console.log(result)             // successful response
 * }).catch(e => console.error(e))   // an error occurred
 */
class Domains extends AbstractService {
  /**
   * Constructs a new Domains object.
   *
   * @see module:core:AbstractService
   */
  constructor (options) {
    super(options, DomainsService.DomainsClient)
    promisifyAll(super.getService(), { metadata: super.getMeta() })
  }

  /**
   * Creates a new Domain at the SIP Proxy subsystem.
   *
   * @param {Object} request
   * @param {string} request.name - Friendly name for the SIP domain
   * @param {string} request.domainUri - Domain URI. FQDN is recommended
   * @param {string} request.egressNumberRef - A valid reference to a Number in YAPS
   * @param {string} request.egressRule - Regular expression indicating when a
   * call will be routed via request.egressNumberRef
   * @param {string} request.accessDeny - Optional list of IPs or networks that
   * cannot communicate with this Domain
   * @param {string} request.accessAllow - Optiona list of IPs or networks
   * allow if request.accessDeny is defined
   * @return {Promise<Object>}
   * @example
   *
   * const request = {
   *    name: 'Local Domain',
   *    domainUri: 'sip.local',
   *    egressRule: '.*',
   *    egressNumberRef: '507f1f77bcf86cd799439011',
   *    accessDeny: ['0.0.0.0/1']     // Deny all
   *    accessAllow: ['192.168.1.0/255.255.255.0', '192.168.0.1/31']
   * }
   *
   * appManager.createDomain(request)
   * .then(result => {
   *   console.log(result)            // returns an empty object
   * }).catch(e => console.error(e))  // an error occurred
   */
  async createDomain (request) {
    logger.log(
      'verbose',
      `@yaps/domains createDomain [request: ${JSON.stringify(request)}]`
    )

    const domain = new DomainsPB.Domain()
    domain.setName(request.name)
    domain.setDomainUri(request.domainUri)
    domain.setEgressRule(request.egressRule)
    domain.setEgressNumberRef(request.egressNumberRef)
    domain.setAccessDenyList(request.accessDeny)
    domain.setAccessAllowList(request.accessAllow)

    const req = new DomainsPB.CreateDomainRequest()
    req.setDomain(domain)

    return super
      .getService()
      .createDomain()
      .sendMessage(req)
  }

  /**
   * Retrives a Domain by its reference.
   *
   * @param {string} ref - Reference to Domain
   * @return {Promise<Domain>} The application
   * @throws if ref is null or Domain does not exist
   * @example
   *
   * domains.getDomain(ref)
   * .then(result => {
   *   console.log(result)             // returns the Domain object
   * }).catch(e => console.error(e))   // an error occurred
   */
  async getDomain (ref) {
    const request = new DomainsPB.GetDomainRequest()
    request.setRef(ref)
    return this.service.getDomain().sendMessage(request)
  }

  /**
   * Deletes a Domain from SIP Proxy subsystem. Notice, that in order to delete
   * a Domain, you must first delete all its Agents.
   *
   * @param {string} ref - Reference to the Domain
   * @example
   *
   * const ref = '507f1f77bcf86cd799439011'
   *
   * domains.deleteDomain(ref)
   * .then(() => {
   *   console.log('done')            // returns an empty object
   * }).catch(e => console.error(e))  // an error occurred
   */
  async deleteDomain (ref) {
    logger.log('verbose', `@yaps/domains deleteDomain [ref: ${ref}]`)

    const req = new DomainsPB.DeleteDomainRequest()
    req.setRef(ref)

    return super
      .getService()
      .deleteDomain()
      .sendMessage(req)
  }
}

module.exports = Domains