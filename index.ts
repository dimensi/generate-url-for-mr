import { clipboard } from './clipboards.ts';

type Project = 'assr' | 'akit'
type Type = 'feature' | 'bugfix'
type Args = [Project?, Type?, string?]

const [project, type, number] = Deno.args as Args

if (!project || !type || !number) {
  console.log('Ты забыл указать project: %s, type: %s, number: %s', project, type, number)
  Deno.exit(1)
}

if (project === 'assr') {
  const result = `http://${type}-alfabankru-${number}.assr.reviews.ci.k8s.alfa.link/`
  console.log(result)
  await clipboard.writeText(result)
  console.log('Сохраненно в буфере обмена')
}

if (project === 'akit') {
  const result = `http://akit-${type}-alfabankru-${number}.alfabankru-reviews.ci.k8s.alfa.link/api/akit/`
  console.log(result)
  await clipboard.writeText(result)
  console.log('Сохраненно в буфере обмена')
}