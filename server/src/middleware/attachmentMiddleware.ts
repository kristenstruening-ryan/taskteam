import { S3Service } from "../services/s3Service";

export const signAttachmentUrls = async (attachmentList: any[]) => {
  return await Promise.all(attachmentList.map(async (att) => {
    if (att.storageKey) {
      const signedUrl = await S3Service.getDownloadUrl(att.storageKey);
      return { ...att, fileUrl: signedUrl };
    }
    return att;
  }));
};