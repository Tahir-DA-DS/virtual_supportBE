import { Request, Response, NextFunction } from 'express';
export interface ValidationRule {
    field: string;
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'array';
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    enum?: readonly any[];
    custom?: (value: any) => boolean | string;
}
export declare const validateRequest: (rules: ValidationRule[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const authValidation: {
    register: ({
        field: string;
        required: boolean;
        type: "string";
        minLength: number;
        maxLength: number;
        pattern?: undefined;
        enum?: undefined;
    } | {
        field: string;
        required: boolean;
        type: "string";
        pattern: RegExp;
        minLength?: undefined;
        maxLength?: undefined;
        enum?: undefined;
    } | {
        field: string;
        required: boolean;
        type: "string";
        minLength: number;
        maxLength?: undefined;
        pattern?: undefined;
        enum?: undefined;
    } | {
        field: string;
        required: boolean;
        type: "string";
        enum: readonly ["student", "tutor"];
        minLength?: undefined;
        maxLength?: undefined;
        pattern?: undefined;
    })[];
    login: ({
        field: string;
        required: boolean;
        type: "string";
        pattern: RegExp;
    } | {
        field: string;
        required: boolean;
        type: "string";
        pattern?: undefined;
    })[];
};
export declare const tutorValidation: {
    profile: ({
        field: string;
        type: "string";
        maxLength: number;
        custom?: undefined;
    } | {
        field: string;
        type: "array";
        maxLength?: undefined;
        custom?: undefined;
    } | {
        field: string;
        type: "number";
        custom: (value: any) => true | "Experience must be non-negative";
        maxLength?: undefined;
    })[];
};
export declare const sessionValidation: {
    create: ({
        field: string;
        required: boolean;
        type: "string";
        minLength?: undefined;
        maxLength?: undefined;
        custom?: undefined;
        enum?: undefined;
    } | {
        field: string;
        required: boolean;
        type: "string";
        minLength: number;
        maxLength: number;
        custom?: undefined;
        enum?: undefined;
    } | {
        field: string;
        required: boolean;
        type: "string";
        custom: (value: any) => true | "Start time must be a valid future date";
        minLength?: undefined;
        maxLength?: undefined;
        enum?: undefined;
    } | {
        field: string;
        required: boolean;
        type: "number";
        custom: (value: any) => true | "Duration must be between 15 and 480 minutes";
        minLength?: undefined;
        maxLength?: undefined;
        enum?: undefined;
    } | {
        field: string;
        type: "string";
        enum: readonly ["one-on-one", "group", "exam-prep", "homework-help"];
        required?: undefined;
        minLength?: undefined;
        maxLength?: undefined;
        custom?: undefined;
    } | {
        field: string;
        required: boolean;
        type: "number";
        custom: (value: any) => true | "Price must be non-negative";
        minLength?: undefined;
        maxLength?: undefined;
        enum?: undefined;
    } | {
        field: string;
        type: "string";
        enum: readonly ["USD", "EUR", "GBP", "CAD", "AUD"];
        required?: undefined;
        minLength?: undefined;
        maxLength?: undefined;
        custom?: undefined;
    } | {
        field: string;
        type: "string";
        maxLength: number;
        required?: undefined;
        minLength?: undefined;
        custom?: undefined;
        enum?: undefined;
    })[];
    update: ({
        field: string;
        type: "string";
        custom: (value: any) => true | "Start time must be a valid future date";
        enum?: undefined;
        maxLength?: undefined;
    } | {
        field: string;
        type: "number";
        custom: (value: any) => true | "Duration must be between 15 and 480 minutes";
        enum?: undefined;
        maxLength?: undefined;
    } | {
        field: string;
        type: "string";
        enum: readonly ["pending", "confirmed", "completed", "cancelled", "no-show"];
        custom?: undefined;
        maxLength?: undefined;
    } | {
        field: string;
        type: "string";
        maxLength: number;
        custom?: undefined;
        enum?: undefined;
    } | {
        field: string;
        type: "string";
        custom: (value: any) => true | "Meeting link must be a valid URL";
        enum?: undefined;
        maxLength?: undefined;
    } | {
        field: string;
        type: "string";
        custom: (value: any) => true | "Recording URL must be a valid URL";
        enum?: undefined;
        maxLength?: undefined;
    } | {
        field: string;
        type: "number";
        custom: (value: any) => true | "Rating must be between 1 and 5";
        enum?: undefined;
        maxLength?: undefined;
    })[];
};
export declare const paymentValidation: {
    createIntent: ({
        field: string;
        required: boolean;
        type: "string";
        custom?: undefined;
        enum?: undefined;
        maxLength?: undefined;
    } | {
        field: string;
        required: boolean;
        type: "number";
        custom: (value: any) => true | "Amount must be greater than 0";
        enum?: undefined;
        maxLength?: undefined;
    } | {
        field: string;
        type: "string";
        enum: readonly ["USD", "EUR", "GBP", "CAD", "AUD"];
        required?: undefined;
        custom?: undefined;
        maxLength?: undefined;
    } | {
        field: string;
        type: "string";
        maxLength: number;
        required?: undefined;
        custom?: undefined;
        enum?: undefined;
    })[];
    confirm: {
        field: string;
        required: boolean;
        type: "string";
    }[];
    refund: ({
        field: string;
        type: "number";
        custom: (value: any) => true | "Refund amount must be greater than 0";
        maxLength?: undefined;
    } | {
        field: string;
        type: "string";
        maxLength: number;
        custom?: undefined;
    })[];
};
export declare const chatValidation: {
    sendMessage: ({
        field: string;
        required: boolean;
        type: "string";
        maxLength?: undefined;
        enum?: undefined;
        custom?: undefined;
    } | {
        field: string;
        required: boolean;
        type: "string";
        maxLength: number;
        enum?: undefined;
        custom?: undefined;
    } | {
        field: string;
        type: "string";
        enum: readonly ["text", "file", "image", "system"];
        required?: undefined;
        maxLength?: undefined;
        custom?: undefined;
    } | {
        field: string;
        type: "string";
        custom: (value: any) => true | "File URL must be a valid HTTP/HTTPS URL";
        required?: undefined;
        maxLength?: undefined;
        enum?: undefined;
    } | {
        field: string;
        type: "string";
        maxLength: number;
        required?: undefined;
        enum?: undefined;
        custom?: undefined;
    } | {
        field: string;
        type: "number";
        custom: (value: any) => true | "File size must be positive";
        required?: undefined;
        maxLength?: undefined;
        enum?: undefined;
    } | {
        field: string;
        type: "string";
        required?: undefined;
        maxLength?: undefined;
        enum?: undefined;
        custom?: undefined;
    })[];
};
//# sourceMappingURL=validation.middleware.d.ts.map