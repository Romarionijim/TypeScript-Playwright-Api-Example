export interface Ipet {
    id?: number,
    category?: { [key: string]: any },
    name: string,
    photoUrls: string[]
    tags?: { [key: string]: any },
    status?: string,
}

export interface IpokemonResults {
    name: string,
    url: string
}


export interface IgoRestApi {

}