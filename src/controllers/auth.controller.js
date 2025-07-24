"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const generateToken_1 = require("../utils/generateToken");
const prisma = new client_1.PrismaClient();
const register = async (req, res) => {
    const { name, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
        return res.status(400).json({ message: 'Email já cadastrado' });
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma.user.create({
        data: { name, email, password: hashedPassword }
    });
    const token = (0, generateToken_1.generateToken)(user.id);
    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, token });
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.status(404).json({ message: 'Usuário não encontrado' });
    const match = await bcryptjs_1.default.compare(password, user.password);
    if (!match)
        return res.status(401).json({ message: 'Senha inválida' });
    const token = (0, generateToken_1.generateToken)(user.id);
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
};
exports.login = login;
const getProfile = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ message: 'Não autenticado' });
    const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { id: true, name: true, email: true }
    });
    if (!user)
        return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(user);
};
exports.getProfile = getProfile;
