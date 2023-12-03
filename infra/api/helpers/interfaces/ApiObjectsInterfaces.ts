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

/**
 * @description GoRestApi User Entity
 */
export interface IUser {
    id?: number,
    name?: string,
    email?: string,
    gender?: string,
    status?: string,
}