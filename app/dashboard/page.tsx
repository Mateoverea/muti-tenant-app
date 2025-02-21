"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type User = {
  id: string
  email: string
  user_metadata: {
    tenant_name?: string
  }
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? "",
          user_metadata: data.user.user_metadata ?? {},
        })
      }
    }
    getUser()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Welcome, {user.email}!</p>
          <p className="mb-4">Tenant: {user.user_metadata?.tenant_name || "No tenant assigned"}</p>
          <Button onClick={handleSignOut} className="w-full">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


