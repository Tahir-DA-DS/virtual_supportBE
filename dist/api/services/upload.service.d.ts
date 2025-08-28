import multer from 'multer';
export declare const upload: multer.Multer;
export declare const profilePictureUpload: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getFileUrl: (filename: string) => string;
export declare const deleteFile: (filename: string) => void;
export declare const validateImageDimensions: (_filePath: string) => Promise<{
    width: number;
    height: number;
}>;
export declare const getFileInfo: (file: Express.Multer.File) => {
    originalName: string;
    filename: string;
    mimetype: string;
    size: number;
    url: string;
};
//# sourceMappingURL=upload.service.d.ts.map