export const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
export const VCARD = $rdf.Namespace('http://www.w3.org/2006/vcard/ns#');
export const store = $rdf.graph();
export const fetcher = new $rdf.Fetcher(store);
export const updater = new $rdf.UpdateManager(store);
export const fileClient = SolidFileClient;