export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function getApiResourceUrl(path: string) {
	return path.startsWith('/deals/') ? `${API_URL}${path}` : path
}
