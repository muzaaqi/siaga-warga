import { createFileRoute } from '@tanstack/react-router'
import { getMyProfileAndReports } from '@/server/functions/profile'
import { ProfilePage } from '@/components/profile/profile-page'

export const Route = createFileRoute('/profil')({
  loader: async () => {
    const data = await getMyProfileAndReports()
    return data
  },
  component: ProfilePage,
})