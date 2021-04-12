import { EmbedFieldService } from "./store/types";

const validateYouTubeUrl = (url = "") => {
    const regExp = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if (url.match(regExp)) {
        return true;
    } else {
        return false;
    }
};

const validateSoundcloudUrl = (url = "") => {
    if (url.match(/^(https?:\/\/)?(www\.)?(soundcloud\.com|snd\.sc)\/.*$/)) {
        return true;
    } else {
        return false;
    }
};

export const getEmbedService = (url: string): EmbedFieldService => {
    // Validate URL
    try {
        new URL(url);
    } catch (e) {
        return EmbedFieldService.Invalid;
    }

    // Match URL to service
    if (validateYouTubeUrl(url)) {
        return EmbedFieldService.YouTube;
    } else if (validateSoundcloudUrl(url)) {
        return EmbedFieldService.Soundcloud;
    } else {
        return EmbedFieldService.Unknown;
    }
};

export const b64 = (contentType: string, data: string) => {
    return "data:" + contentType + ";base64," + data;
};

export const getAttachmentIcon = (type: string) => {
    if (type.startsWith("text/")) {
        return "description";
    }
    if (type.startsWith("image/")) {
        return "insert_photo";
    }
    if (type.startsWith("audio/")) {
        return "headset";
    }
    if (type.startsWith("video/")) {
        return "movie";
    }
    return "insert_drive_file";
};

export const renderText = (data: string) => {
    return atob(data);
};

export const b64toBlob = (b64Data: string, contentType?: string, sliceSize?: number) => {
    contentType = contentType || "";
    sliceSize = sliceSize || 512;

    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
};
