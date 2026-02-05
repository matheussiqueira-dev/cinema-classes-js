function toLogLine(level, message, metadata = {}) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata,
  });
}

function isMutedInTest() {
  return process.env.NODE_ENV === 'test' && process.env.LOG_IN_TEST !== 'true';
}

function info(message, metadata = {}) {
  if (isMutedInTest()) return;
  console.log(toLogLine('info', message, metadata));
}

function warn(message, metadata = {}) {
  if (isMutedInTest()) return;
  console.warn(toLogLine('warn', message, metadata));
}

function error(message, metadata = {}) {
  if (isMutedInTest()) return;
  console.error(toLogLine('error', message, metadata));
}

module.exports = {
  info,
  warn,
  error,
};
