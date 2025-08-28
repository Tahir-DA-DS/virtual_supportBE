"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const tutor_controller_1 = require("../controllers/tutor.controller");
const router = (0, express_1.Router)();
// Only authenticated tutors can create/update profile
router.post('/profile', auth_middleware_1.authenticate, (0, auth_middleware_1.authorizeRole)('tutor'), (0, validation_middleware_1.validateRequest)(validation_middleware_1.tutorValidation.profile), tutor_controller_1.createOrUpdateProfile);
// Anyone can list all tutors (must come before parameterized route)
router.get('/all', tutor_controller_1.getAllProfiles);
// Anyone can view tutor by ID (must come after specific routes)
router.get('/:id/profile', tutor_controller_1.getProfile);
exports.default = router;
//# sourceMappingURL=tutor.routes.js.map