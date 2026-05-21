let photoData: string | null = null

export function setWelcomePhoto(data: string) {
  photoData = data
}

export function getWelcomePhoto(): string | null {
  return photoData
}
