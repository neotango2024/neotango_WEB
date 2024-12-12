import sharp from 'sharp';
import awsCommands from '../utils/aws/awsCommands.js';
import ProductFile from '../database/models/ProductFile.js';
const {putFile} = awsCommands;

const controller = {
    handleCreateFiles: async (files, productId) => {
        const filesToInsertInDb = [];
    
        for (const file of files) {
            const randomName = 'product-' + Math.random().toString(36).substring(2, 2 + 10) + '.webp';
            try {
                const buffer = await sharp(file.buffer).toFormat('webp').toBuffer();
                const isUploadSuccessful = await putFile(randomName, buffer);
                if (!isUploadSuccessful) {
                    console.log(`Failed to upload file ${randomName}`);
                    return false; 
                }

                filesToInsertInDb.push({
                    file: randomName,
                    product_id: productId,
                });
            } catch (error) {
                console.log(`Error processing file ${randomName}: ${error}`);
                return false; // Salir inmediatamente si hay un error en el procesamiento
            }
        }
        return await insertFilesInDb(filesToInsertInDb);
    },
    insertFilesInDb: async (files) => {
        try {
            await ProductFile.bulkCreate(files, {
                validate: true,
            });
            return true;
        } catch (error) {
            console.log(`Error inserting files in db: ${error}`);
            return false;
        }
    },
    findFilesInDb: async (productId) => {
        try {
            const files = await ProductFile.findAll({
                where: {
                    product_id: productId
                }
            })
            return files;
        } catch (error) {
            console.log(`Error finding files in db: ${error}`);
            return [];
        }
    },
    deleteFileInDb: async (file, productId) => {
        try {
            await ProductFile.destroy({
                where: {
                    product_id: productId,
                    file
                }
            })
            return true;
        } catch (error) {
            console.log(`Error deleting file in db ${error}`);
            return false;
        }
    }
}

export default controller;