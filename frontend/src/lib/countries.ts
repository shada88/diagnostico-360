export interface CountryData {
    iso: string;
    name: string;
    dialCode: string;
}

export const countries: CountryData[] = [
    { iso: "AR", name: "Argentina", dialCode: "+54" },
    { iso: "BO", name: "Bolivia", dialCode: "+591" },
    { iso: "BR", name: "Brasil", dialCode: "+55" },
    { iso: "CL", name: "Chile", dialCode: "+56" },
    { iso: "CO", name: "Colombia", dialCode: "+57" },
    { iso: "CR", name: "Costa Rica", dialCode: "+506" },
    { iso: "CU", name: "Cuba", dialCode: "+53" },
    { iso: "DO", name: "República Dominicana", dialCode: "+1" },
    { iso: "EC", name: "Ecuador", dialCode: "+593" },
    { iso: "SV", name: "El Salvador", dialCode: "+503" },
    { iso: "GT", name: "Guatemala", dialCode: "+502" },
    { iso: "HN", name: "Honduras", dialCode: "+504" },
    { iso: "MX", name: "México", dialCode: "+52" },
    { iso: "NI", name: "Nicaragua", dialCode: "+505" },
    { iso: "PA", name: "Panamá", dialCode: "+507" },
    { iso: "PY", name: "Paraguay", dialCode: "+595" },
    { iso: "PE", name: "Perú", dialCode: "+51" },
    { iso: "PR", name: "Puerto Rico", dialCode: "+1" },
    { iso: "UY", name: "Uruguay", dialCode: "+598" },
    { iso: "VE", name: "Venezuela", dialCode: "+58" },
    { iso: "US", name: "Estados Unidos", dialCode: "+1" },
    { iso: "ES", name: "España", dialCode: "+34" }
];
