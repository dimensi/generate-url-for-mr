import { clipboard } from './clipboards.ts';

type Project = 'assr' | 'akit'
type Type = 'feature' | 'bugfix'
type Args = [Project?, Type?, string?]

let [project, type, number] = Deno.args as Args

const projectPaths = {
  akit: '../akit/',
  assr: '../assr/'
}

if (!project) {
  console.error('Ты не указал project')
  Deno.exit(1)
}

if (![type, number].every(Boolean)) {
  const git = Deno.run({
    cmd: ['git', 'branch', '--show-current'],
    cwd: projectPaths[project],
    stdout: 'piped',
    stderr: 'piped'
  })
  
  const { code } = await git.status()
  
  if (code === 0) {
    const rawOutput = await git.output()
    const output = new TextDecoder().decode(rawOutput)
    const [firstPart, secondPart] = output.trim().split('/')
    if (['feature', 'bugfix'].includes(firstPart)) {
      type = firstPart as Type
    } else {
      console.log('Не могу распарсить или значения не подходящие', firstPart)
      Deno.exit(1)
    }

    if (secondPart.includes('ALFABANKRU-')) {
      number = secondPart.replace('ALFABANKRU-', '')
    } else {
      console.log('Не нашел шаблона', secondPart)
      Deno.exit(1)
    }
  } else {
    const rawError = await git.stderrOutput();
    const errorString = new TextDecoder().decode(rawError);
    console.error(errorString);
    Deno.exit(1)
  }
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