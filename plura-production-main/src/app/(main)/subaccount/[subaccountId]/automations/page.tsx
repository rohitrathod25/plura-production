import { db } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Props = {
  params: { subaccountId: string }
}

const AutomationsPage = async ({ params }: Props) => {
  const automations = await db.automation.findMany({
    where: {
      subAccountId: params.subaccountId,
    },
    include: {
      Trigger: true,
      Action: true,
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Automations</h1>
        <Link href={`/subaccount/${params.subaccountId}/automations/create`}>
          <Button>Create Automation</Button>
        </Link>
      </div>

      {automations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Automations Yet</CardTitle>
            <CardDescription>
              Create your first automation to start automating tasks
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {automations.map((automation) => (
            <Card key={automation.id}>
              <CardHeader>
                <CardTitle className="text-lg">{automation.name}</CardTitle>
                <CardDescription>
                  {automation.published ? (
                    <span className="text-green-600">Published</span>
                  ) : (
                    <span className="text-yellow-600">Draft</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>Trigger: {automation.Trigger?.type || 'None'}</p>
                  <p>Actions: {automation.Action.length}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default AutomationsPage
