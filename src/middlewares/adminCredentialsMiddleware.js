
import jwt from "jsonwebtoken";
import { getUsersFromDB } from "../controllers/api/apiUserController.js";
import { HTTP_STATUS } from "../utils/staticDB/httpStatusCodes.js";

const webTokenSecret = process.env.JSONWEBTOKEN_SECRET;

const adminCredentialsMiddleware = async (req, res, next) => {
    try {
        const { cookies } = req;
        const adminAuthCookie = cookies.adminAuth;
        const userAccessToken = cookies.userAccessToken;

        // 1️⃣ Intentar validar la cookie de adminAuth primero
        if (adminAuthCookie) {
            try {
                const decodedAdminToken = jwt.verify(adminAuthCookie, webTokenSecret);
                if (decodedAdminToken.id) return next(); // Token válido, continuar sin más verificaciones
            } catch (err) {
                console.warn("Invalid or expired admin token, removing cookie:", err);
                res.clearCookie("adminAuth"); // Limpiar cookie inválida, sigue con la ejecucion
            }
        }

        // 2️⃣ Si no hay cookie de adminAuth, revisar userAccessToken
        if (userAccessToken) {
            try {
                const decodedUserToken = jwt.verify(userAccessToken, webTokenSecret);
                
                if (!decodedUserToken.id) {
                    console.warn("Invalid user token structure");
                    res.clearCookie("userAccessToken"); // Si el token no tiene el ID, limpiarlo
                    return res.status(HTTP_STATUS.UNAUTHORIZED.code).json({ msg: "Problem processing credentials, please log in again" });
                }

                // Consultar en la base de datos si es admin
                const userFromDB = await getUsersFromDB(decodedUserToken.id);
                
                if (!userFromDB) {
                    console.warn("User not found in database");
                    res.clearCookie("userAccessToken"); // Limpiar cookie si el usuario no existe
                    return res.status(HTTP_STATUS.UNAUTHORIZED.code).json({ msg: "Problem processing credentials, please log in again" });
                }

                // Si es admin, regenerar la cookie adminAuth
                if (userFromDB.user_role_id == 1) {
                    const adminToken = jwt.sign({ id: userFromDB.id }, webTokenSecret, { expiresIn: "4h" });

                    res.cookie("adminAuth", adminToken, {
                        maxAge: 1000 * 60 * 60 * 4, // 4 horas
                        httpOnly: true,
                        secure: process.env.NODE_ENV == "production",
                        sameSite: "strict",
                    });

                    return next();
                }
            } catch (err) {
                console.error("Error verifying userAccessToken:", err);
                res.clearCookie("userAccessToken"); // Si hay error, limpiar token inválido
            }
        }

        // 3️⃣ Si no hay credenciales válidas, rechazar la solicitud
        return res.status(HTTP_STATUS.UNAUTHORIZED.code).json({ msg: "Problem processing credentials, please log in again" });

    } catch (error) {
        console.error("Unexpected error in admin middleware:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR.code).json({ msg: "Internal server error" });
    }
};

export default adminCredentialsMiddleware; 