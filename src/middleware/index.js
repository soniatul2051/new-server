import multer from "multer"

const upload = multer({
    storage : multer.memoryStorage()
})
// const upload = multer({
//     storage : storage
// })

export {upload}