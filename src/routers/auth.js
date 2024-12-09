import { Router } from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { loginUserController, logoutUserControllerler, registerUserController, refreshUserSessionController,  requestResetEmailController, resetPasswordController, loginWithGoogleController } from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { loginUserSchema, loginWithGoogleOAuthSchema, registerUserSchema, requestResetEmailSchema, resetPasswordSchema} from "../validation/auth.js";
import { getGoogleOAuthUrlController } from '../controllers/auth.js';

import { } from '../controllers/auth.js';

const router = Router();
router.get('/get-oauth-url', ctrlWrapper(getGoogleOAuthUrlController));
router.post('/register', validateBody(registerUserSchema), ctrlWrapper(registerUserController));
router.post('/login', validateBody(loginUserSchema), ctrlWrapper(loginUserController));
router.post('/logout', ctrlWrapper(logoutUserControllerler));
router.post('/refresh', ctrlWrapper(refreshUserSessionController));
router.post('/request-rest-email', validateBody(requestResetEmailSchema), ctrlWrapper(requestResetEmailController));
router.post('/reset-password', validateBody(resetPasswordSchema), ctrlWrapper(resetPasswordController));
router.post('/confirm-oauth', validateBody(loginWithGoogleOAuthSchema), ctrlWrapper(loginWithGoogleController));

export default router;
