/**
 * hooks/formState.js
 *
 * Estado inicial e reducer compartilhado pelos formulários PJ e PF.
 * Dispatch: { key: string, val: any }
 */

export const INITIAL_FORM = {
  // Dados da empresa
  businessName:  "",
  tradeName:     "",
  cnpj:          "",
  cnpjVerified:  false,
  email:         "",
  phone:         "",
  whatsapp:      "",
  instagram:     "",
  description:   "",
  // Endereço
  cep:           "",
  street:        "",
  number:        "",
  complement:    "",
  neighborhood:  "",
  city:          "",
  state:         "",
  // Responsável
  ownerName:     "",
  ownerEmail:    "",
  ownerCPF:      "",
  ownerPhone:    "",
  ownerDoc:      null,
  addressProof:  null,
  // Verificação OTP
  emailCode:     "",
  emailVerified: false,
  phoneCode:     "",
  phoneVerified: false,
  // Acesso
  password:        "",
  confirmPassword: "",
  acceptTerms:     false,
  acceptPrivacy:   false,
  acceptAntiFraud: false,
};

export const INITIAL_FORM_PF = {
  // Dados pessoais
  fullName:      "",
  cpf:           "",
  email:         "",
  phone:         "",
  whatsapp:      "",
  instagram:     "",
  bio:           "",
  // Endereço
  cep:           "",
  street:        "",
  number:        "",
  complement:    "",
  neighborhood:  "",
  city:          "",
  state:         "",
  // Verificação
  emailCode:     "",
  emailVerified: false,
  // Acesso
  password:        "",
  confirmPassword: "",
  acceptTerms:     false,
  acceptPrivacy:   false,
};

/** Reducer genérico — chave/valor simples */
export function formReducer(state, action) {
  return { ...state, [action.key]: action.val };
}
