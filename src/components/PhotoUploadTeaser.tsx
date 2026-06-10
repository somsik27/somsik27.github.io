import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  MessageCircleHeart,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import type { UploadSettings } from '../data/invitation';

type PhotoUploadTeaserProps = {
  settings: UploadSettings;
};

type PreviewFile = {
  id: string;
  file: File;
  previewUrl: string;
};

type EncodedFile = {
  name: string;
  type: string;
  size: number;
  base64: string;
};

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function readFileAsBase64(file: File): Promise<EncodedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result);
      const [, base64 = ''] = result.split(',');

      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        base64,
      });
    };
    reader.onerror = () => reject(new Error(`${file.name} 파일을 읽지 못했습니다.`));
    reader.readAsDataURL(file);
  });
}

function createFileId(file: File) {
  const randomId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `${file.name}-${file.lastModified}-${randomId}`;
}

function postUpload(
  endpointUrl: string,
  payload: unknown,
  onProgress: (progress: number) => void,
) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 45000);

  return fetch(endpointUrl, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify(payload),
    signal: controller.signal,
  })
    .then(() => {
      onProgress(90);
    })
    .catch((error) => {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('전송 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.');
      }

      throw new Error('네트워크 연결을 확인해 주세요.');
    })
    .finally(() => {
      window.clearTimeout(timeoutId);
    });
}

export function PhotoUploadTeaser({ settings }: PhotoUploadTeaserProps) {
  const [guestName, setGuestName] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [statusMessage, setStatusMessage] = useState(settings.teaserText);
  const [statusType, setStatusType] = useState<'idle' | 'success' | 'error'>(
    'idle',
  );
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const accept = useMemo(
    () => settings.allowedMimeTypes.join(','),
    [settings.allowedMimeTypes],
  );
  const maxBytes = settings.maxFileSizeMb * 1024 * 1024;

  useEffect(() => {
    return () => {
      files.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [files]);

  if (!settings.enabled) {
    return (
      <section className="section photo-upload">
        <SectionHeader eyebrow="Guestbook" title="방명록과 사진 공유" />
        <div className="photo-upload__teaser">
          <MessageCircleHeart size={24} aria-hidden="true" />
          <div>
            <strong>예식 후 공유 링크가 열릴 예정입니다.</strong>
            <p>{settings.teaserText}</p>
          </div>
        </div>
      </section>
    );
  }

  const handleSelectFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const remainingSlots = settings.maxFiles - files.length;
    const validFiles: PreviewFile[] = [];
    const errors: string[] = [];

    selectedFiles.slice(0, remainingSlots).forEach((file) => {
      if (!settings.allowedMimeTypes.includes(file.type)) {
        errors.push(`${file.name} 파일 형식을 확인해 주세요.`);
        return;
      }

      if (file.size > maxBytes) {
        errors.push(
          `${file.name} 파일은 ${settings.maxFileSizeMb}MB 이하로 올려 주세요.`,
        );
        return;
      }

      validFiles.push({
        id: createFileId(file),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    });

    if (selectedFiles.length > remainingSlots) {
      errors.push(`사진은 최대 ${settings.maxFiles}장까지 선택할 수 있습니다.`);
    }

    setFiles((currentFiles) => [...currentFiles, ...validFiles]);
    setStatusType(errors.length ? 'error' : 'idle');
    setStatusMessage(errors.length ? errors.join(' ') : settings.teaserText);
    event.target.value = '';
  };

  const handleRemoveFile = (id: string) => {
    setFiles((currentFiles) => {
      const target = currentFiles.find((item) => item.id === id);

      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return currentFiles.filter((item) => item.id !== id);
    });
  };

  const resetForm = () => {
    files.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setFiles([]);
    setGuestName('');
    setMessage('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!settings.endpointUrl) {
      setStatusType('error');
      setStatusMessage('방명록과 사진 공유 링크를 준비하고 있습니다.');
      return;
    }

    if (!guestName.trim()) {
      setStatusType('error');
      setStatusMessage('이름을 입력해 주세요.');
      return;
    }

    if (!message.trim() && !files.length) {
      setStatusType('error');
      setStatusMessage('메시지를 남기거나 공유할 사진을 선택해 주세요.');
      return;
    }

    setIsUploading(true);
    setProgress(5);
    setStatusType('idle');
    setStatusMessage(files.length ? '사진을 준비하고 있습니다.' : '방명록을 남기고 있습니다.');

    try {
      const encodedFiles = await Promise.all(
        files.map((item) => readFileAsBase64(item.file)),
      );
      setProgress(35);

      await postUpload(
        settings.endpointUrl,
        {
          action: files.length ? 'photoShare' : 'guestbook',
          guestName: guestName.trim(),
          message: message.trim(),
          files: encodedFiles,
        },
        setProgress,
      );

      setProgress(100);
      setStatusType('success');
      setStatusMessage(settings.successMessage);
      resetForm();
    } catch (error) {
      setStatusType('error');
      setStatusMessage(
        error instanceof Error ? error.message : '업로드에 실패했습니다.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="section photo-upload">
      <SectionHeader eyebrow="Guestbook" title="방명록과 사진 공유" />
      <div className="share-intro">
        <MessageCircleHeart size={22} aria-hidden="true" />
        <p>
          축하 메시지를 남겨 주세요. 예식 사진이 있다면 함께 공유할 수 있습니다.
        </p>
      </div>
      <form className="upload-panel" onSubmit={handleSubmit}>
        {!settings.endpointUrl ? (
          <p className="upload-panel__notice">
            방명록과 사진 공유 링크를 준비하고 있습니다.
          </p>
        ) : null}
        <label>
          이름
          <input
            type="text"
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
            placeholder="이름을 입력해 주세요"
            autoComplete="name"
          />
        </label>
        <label>
          메시지
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="전하고 싶은 말을 남겨 주세요"
            rows={4}
            maxLength={500}
          />
        </label>
        <label className="upload-panel__picker">
          <ImageIcon size={20} aria-hidden="true" />
          <span>
            사진 선택
            <small>
              선택 사항 · 최대 {settings.maxFiles}장, 장당 {settings.maxFileSizeMb}MB
            </small>
          </span>
          <input
            type="file"
            accept={accept}
            multiple
            onChange={handleSelectFiles}
            aria-label="공유할 사진 선택"
          />
        </label>

        {files.length ? (
          <div className="upload-preview" aria-label="선택한 사진 미리보기">
            {files.map((item) => (
              <figure key={item.id}>
                <img
                  src={item.previewUrl}
                  alt={`${item.file.name} 미리보기`}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>{formatFileSize(item.file.size)}</figcaption>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(item.id)}
                  aria-label={`${item.file.name} 제거`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </figure>
            ))}
          </div>
        ) : null}

        {isUploading ? (
          <div
            className="upload-progress"
            role="progressbar"
            aria-label="사진 업로드 진행률"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
        ) : null}

        <p className={`upload-status upload-status--${statusType}`} aria-live="polite">
          {statusType === 'success' ? <CheckCircle size={16} aria-hidden="true" /> : null}
          {statusType === 'error' ? <AlertCircle size={16} aria-hidden="true" /> : null}
          <span>{statusMessage}</span>
        </p>

        <button
          className="upload-panel__submit"
          type="submit"
          disabled={isUploading || !settings.endpointUrl}
        >
          {files.length ? (
            <UploadCloud size={18} aria-hidden="true" />
          ) : (
            <MessageCircleHeart size={18} aria-hidden="true" />
          )}
          <span>
            {isUploading
              ? '전송 중'
              : files.length
                ? settings.submitLabel
                : '방명록 남기기'}
          </span>
        </button>
      </form>
    </section>
  );
}
