var DEFAULT_ALLOWED_MIME_TYPES = 'image/jpeg,image/png,image/webp';
var DEFAULT_MAX_FILES = 5;
var DEFAULT_MAX_FILE_SIZE_MB = 8;
var DEFAULT_MAX_MESSAGE_LENGTH = 500;
var UPLOAD_HEADERS = [
  'timestamp',
  'guest_name',
  'message',
  'file_links',
  'file_ids',
  'file_names',
  'file_count',
];
var GUESTBOOK_HEADERS = ['timestamp', 'guest_name', 'message', 'file_count'];

function doPost(e) {
  try {
    var payload = parsePayload_(e);
    var props = PropertiesService.getScriptProperties();
    var sheetId = requireProperty_(props, 'SHEET_ID');
    var sheetName = props.getProperty('SHEET_NAME') || 'uploads';
    var guestbookSheetName = props.getProperty('GUESTBOOK_SHEET_NAME') || 'guestbook';
    var maxFiles = Number(props.getProperty('MAX_FILES') || DEFAULT_MAX_FILES);
    var maxFileSizeMb = Number(
      props.getProperty('MAX_FILE_SIZE_MB') || DEFAULT_MAX_FILE_SIZE_MB,
    );
    var maxMessageLength = Number(
      props.getProperty('MAX_MESSAGE_LENGTH') || DEFAULT_MAX_MESSAGE_LENGTH,
    );
    var allowedMimeTypes = (
      props.getProperty('ALLOWED_MIME_TYPES') || DEFAULT_ALLOWED_MIME_TYPES
    )
      .split(',')
      .map(function (type) {
        return type.trim();
      });

    var action = String(payload.action || '').trim() || 'photoShare';
    var guestName = sanitizeText_(payload.guestName, 80);
    var message = sanitizeText_(payload.message, maxMessageLength);
    var files = Array.isArray(payload.files) ? payload.files : [];

    if (!guestName) {
      return json_({ ok: false, message: '이름을 입력해 주세요.' });
    }

    if (!message && !files.length) {
      return json_({ ok: false, message: '메시지나 사진을 남겨 주세요.' });
    }

    if (files.length > maxFiles) {
      return json_({
        ok: false,
        message: '사진은 최대 ' + maxFiles + '장까지 업로드할 수 있습니다.',
      });
    }

    if (action === 'guestbook' || !files.length) {
      appendGuestbook_(sheetId, guestbookSheetName, guestName, message);

      return json_({
        ok: true,
        message: '방명록이 잘 남겨졌습니다.',
      });
    }

    var folderId = requireProperty_(props, 'DRIVE_FOLDER_ID');
    var folder = DriveApp.getFolderById(folderId);
    var sheet = getSheet_(sheetId, sheetName);
    var fileLinks = files.map(function (file) {
      return saveFile_(folder, file, allowedMimeTypes, maxFileSizeMb);
    });

    sheet.appendRow([
      new Date(),
      guestName,
      message,
      fileLinks
        .map(function (file) {
          return file.url;
        })
        .join('\n'),
      fileLinks
        .map(function (file) {
          return file.id;
        })
        .join('\n'),
      fileLinks
        .map(function (file) {
          return file.name;
        })
        .join('\n'),
      fileLinks.length,
    ]);
    appendGuestbook_(sheetId, guestbookSheetName, guestName, message, fileLinks.length);

    return json_({
      ok: true,
      message: '방명록과 사진이 잘 전달되었습니다.',
      files: fileLinks,
    });
  } catch (error) {
    return json_({
      ok: false,
      message: error && error.message ? error.message : '업로드에 실패했습니다.',
    });
  }
}

function doGet() {
  return json_({ ok: true, message: 'Wedding guestbook and photo endpoint is ready.' });
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('요청 본문이 비어 있습니다.');
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw new Error('요청 본문을 JSON으로 해석하지 못했습니다.');
  }
}

function requireProperty_(props, key) {
  var value = props.getProperty(key);

  if (!value) {
    throw new Error('Apps Script property ' + key + ' 값을 설정해 주세요.');
  }

  return value;
}

function getSheet_(sheetId, sheetName) {
  var spreadsheet = SpreadsheetApp.openById(sheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(UPLOAD_HEADERS);
  } else {
    ensureUploadHeaders_(sheet);
  }

  return sheet;
}

function appendGuestbook_(sheetId, sheetName, guestName, message, fileCount) {
  var sheet = getGuestbookSheet_(sheetId, sheetName);

  sheet.appendRow([
    new Date(),
    guestName,
    message,
    Number(fileCount || 0),
  ]);
}

function getGuestbookSheet_(sheetId, sheetName) {
  var spreadsheet = SpreadsheetApp.openById(sheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(GUESTBOOK_HEADERS);
  }

  return sheet;
}

function ensureUploadHeaders_(sheet) {
  var lastColumn = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];

  if (headers.indexOf('file_ids') !== -1) {
    return;
  }

  var fileLinksIndex = headers.indexOf('file_links') + 1;

  if (fileLinksIndex > 0) {
    sheet.insertColumnAfter(fileLinksIndex);
    sheet.getRange(1, fileLinksIndex + 1).setValue('file_ids');
    return;
  }

  sheet.getRange(1, lastColumn + 1).setValue('file_ids');
}

function saveFile_(folder, file, allowedMimeTypes, maxFileSizeMb) {
  if (!file || !file.base64) {
    throw new Error('사진 데이터가 누락되었습니다.');
  }

  var mimeType = String(file.type || '').trim();

  if (allowedMimeTypes.indexOf(mimeType) === -1) {
    throw new Error('허용되지 않은 파일 형식입니다: ' + mimeType);
  }

  var bytes = Utilities.base64Decode(file.base64);
  var maxBytes = maxFileSizeMb * 1024 * 1024;

  if (bytes.length > maxBytes) {
    throw new Error('사진은 장당 ' + maxFileSizeMb + 'MB 이하로 업로드해 주세요.');
  }

  var timestamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyyMMdd-HHmmss',
  );
  var fileName = timestamp + '-' + sanitizeFileName_(file.name || 'photo');
  var blob = Utilities.newBlob(bytes, mimeType, fileName);
  var driveFile = folder.createFile(blob);

  if (PropertiesService.getScriptProperties().getProperty('SHARE_UPLOADED_FILES') === 'true') {
    try {
      driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (error) {
      // 조직 정책상 링크 공유가 막혀도 Sheet에는 Drive 파일 URL을 남깁니다.
    }
  }

  return {
    id: driveFile.getId(),
    name: driveFile.getName(),
    url: driveFile.getUrl(),
  };
}

function sanitizeText_(value, maxLength) {
  return String(value || '')
    .trim()
    .slice(0, maxLength || 1000);
}

function sanitizeFileName_(value) {
  return String(value)
    .replace(/[\\/:*?"<>|#%{}~&]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
