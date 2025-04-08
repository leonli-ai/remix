export const extractPoFileName = (url: string) => {
  const parsedUrl = new URL(url);
  const pathSegments = parsedUrl.pathname.split("/");
  const fileArray = pathSegments[pathSegments.length - 1].split("-");

  if (fileArray.length > 1) {
    fileArray.shift();
    return fileArray.join("-");
  }

  return fileArray[fileArray.length - 1];
};
