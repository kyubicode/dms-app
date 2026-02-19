export const getFileUrl = (dbPath: string | null | undefined) => {
  if (!dbPath) return undefined;

  // 1. Bersihkan backslash jadi forward slash (Windows ke Browser)
  const standardizedPath = dbPath.replace(/\\/g, '/');

  // 2. Tambahkan protocol file:///
  // Kita pakai triple slash agar path absolut C:/... terbaca sempurna
  return `file:///${standardizedPath}`.replace('file:///file:///', 'file:///');
};