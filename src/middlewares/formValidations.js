const { body } = require("express-validator");

export default {
    productFields: [
        body(["name", "ars_price", "usd_price", "english_description", "spanish_description", "sku", "email"])
            .notEmpty()
            .withMessage("Complete todos los campos necesarios")
            .bail(),
        body(["email"])
            .isEmail()
            .withMessage("Tipo de email invalido")
            .bail(),
        body(["variations"])
            .notEmpty()
            .withMessage("Necesita tener al menos una variación")
            .bail()
            .isArray()
            .withMessage("Formato incorrecto de variaciones")
            .bail()
            .custom(variationsArray => {
                variationsArray.forEach(variation => {
                    const allNecesaryFields = 
                            typeof variation.size_id === 'number' &&
                            typeof variation.taco_id === 'number' &&
                            typeof variation.color_id === 'number' &&
                            typeof variation.quantity === 'number';
                    if(!allNecesaryFields){
                        throw new Error("Faltan propiedades necesarias en las variaciones")
                    }
                })
            }),
        body(["images"])
            .notEmpty()
            .withMessage("Adjunte al menos una imagen")
            .bail()
            .isArray()
            .withMessage("Formato incorrecto de imagenes")
            .bail()
      ],
}