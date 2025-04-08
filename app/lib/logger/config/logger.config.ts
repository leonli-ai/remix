import winston, { format } from 'winston';

const { combine, timestamp, printf, colorize } = format;

const customFormat = printf((info: winston.Logform.TransformableInfo) => {
  // Convert BigInt to string in metadata
  const processValue = (value: any): any => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    if (Array.isArray(value)) {
      return value.map(processValue);
    }
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, processValue(v)])
      );
    }
    return value;
  };

  let msg = `${info.timestamp} [${info.level}] : ${info.message}`;
  
  // Process additional metadata if exists
  if (Object.keys(info).length > 3) {
    const { timestamp, level, message, ...metadata } = info;
    const processedMetadata = processValue(metadata);
    msg += ` ${JSON.stringify(processedMetadata)}`;
  }
  
  return msg;
});

export const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: [
    new winston.transports.Console()
  ]
}; 