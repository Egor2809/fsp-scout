import { Link } from 'react-router'
import { EmptyState } from '@/components/states'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <EmptyState
      title="Страница не найдена"
      description="Возможно, ссылка устарела или у вас нет к ней доступа."
      action={
        <Button asChild variant="outline">
          <Link to="/">На главную</Link>
        </Button>
      }
    />
  )
}
