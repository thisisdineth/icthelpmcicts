export default function handler(req, res) {
    res.status(200).json({
        API_URL: process.env.API_URL,
        CLUB_MEMORY: process.env.CLUB_MEMORY
    });
}