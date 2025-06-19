import {
  SignalEvent,
  CsvParserConfig,
} from '../../services/csvParser/csvParser.types';

export interface CsvUploaderProps {
  onFileUpload: (events: SignalEvent[]) => void;
  onError: (error: Error) => void;
  config?: CsvParserConfig;
  disabled?: boolean;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
}

export interface CsvUploaderState {
  isDragOver: boolean;
  isUploading: boolean;
  uploadProgress: number;
}

export interface FileUploadEvent extends Event {
  target: HTMLInputElement & EventTarget;
}
