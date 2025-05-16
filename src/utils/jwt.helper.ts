import { JwtService } from "@nestjs/jwt"
const jwtService: JwtService = new JwtService()

/**
 * Function to generate new JWT token with provided payload
 * @param payload 
 * @returns generated JWT token
*/
export const generateJwtToken = (payload: { id: number }): string => {
    try {
        const generatedToken: string = jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_TOKEN_SECRET || 'secret',
            expiresIn: process.env.ACCESS_TOKEN_VALIDITY_DURATION || '1d'
        })
        return generatedToken
    } catch (error) {
        throw error
    }
}