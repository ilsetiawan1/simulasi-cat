import { describe, expect, test } from "bun:test";
import { evaluatePasswordRules } from "../utils/password-rules";

describe("evaluatePasswordRules", () => {
  test("menolak kata sandi kosong atau terlalu pendek", () => {
    const empty = evaluatePasswordRules("");
    expect(empty.isValid).toBe(false);
    expect(empty.minLength).toBe(false);

    const short = evaluatePasswordRules("Ab1!");
    expect(short.minLength).toBe(false);
    expect(short.hasLowercase).toBe(true);
    expect(short.hasUppercase).toBe(true);
    expect(short.hasNumberOrSymbol).toBe(true);
    expect(short.isValid).toBe(false);
  });

  test("menolak kata sandi tanpa huruf besar", () => {
    const res = evaluatePasswordRules("cpns2024!");
    expect(res.minLength).toBe(true);
    expect(res.hasLowercase).toBe(true);
    expect(res.hasUppercase).toBe(false);
    expect(res.hasNumberOrSymbol).toBe(true);
    expect(res.isValid).toBe(false);
  });

  test("menolak kata sandi tanpa angka atau simbol", () => {
    const res = evaluatePasswordRules("SimulasiCat");
    expect(res.minLength).toBe(true);
    expect(res.hasLowercase).toBe(true);
    expect(res.hasUppercase).toBe(true);
    expect(res.hasNumberOrSymbol).toBe(false);
    expect(res.isValid).toBe(false);
  });

  test("menerima kata sandi campuran huruf besar, huruf kecil, dan angka/simbol minimal 8 karakter", () => {
    expect(evaluatePasswordRules("Simcat2024").isValid).toBe(true);
    expect(evaluatePasswordRules("Simcat!@#").isValid).toBe(true);
    expect(evaluatePasswordRules("Simcat 2024").isValid).toBe(true);
  });
});
