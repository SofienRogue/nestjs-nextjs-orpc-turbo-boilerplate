export interface MinioFile extends Express.Multer.File {
  location: string;
  key: string;
  bucket: string;
}
