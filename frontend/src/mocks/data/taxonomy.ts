import type { Industry, Skill, Specialization, Taxonomy } from '@/api/generated/model'

export const COMPETENCIES: Record<Specialization, { id: string; name: string }[]> = {
  backend: [
    { id: 'backend.languages', name: 'Языки и рантайм' },
    { id: 'backend.databases', name: 'Базы данных и SQL' },
    { id: 'backend.architecture', name: 'Архитектура и system design' },
    { id: 'backend.messaging', name: 'Очереди и интеграции' },
    { id: 'backend.reliability', name: 'Надёжность и отладка' },
  ],
  frontend: [
    { id: 'frontend.core', name: 'JavaScript и TypeScript' },
    { id: 'frontend.frameworks', name: 'Фреймворки и состояние' },
    { id: 'frontend.layout', name: 'Вёрстка и доступность' },
    { id: 'frontend.performance', name: 'Производительность' },
    { id: 'frontend.testing', name: 'Тестирование' },
  ],
  mobile: [
    { id: 'mobile.ios', name: 'iOS' },
    { id: 'mobile.android', name: 'Android' },
    { id: 'mobile.cross', name: 'Кроссплатформа' },
  ],
  qa: [
    { id: 'qa.design', name: 'Тест-дизайн' },
    { id: 'qa.automation', name: 'Автоматизация' },
    { id: 'qa.performance', name: 'Нагрузка и производительность' },
  ],
  devops: [
    { id: 'devops.ci', name: 'CI/CD' },
    { id: 'devops.orchestration', name: 'Контейнеры и оркестрация' },
    { id: 'devops.observability', name: 'Наблюдаемость' },
    { id: 'devops.iac', name: 'Инфраструктура как код' },
  ],
  data_ml: [
    { id: 'data.ml', name: 'Машинное обучение' },
    { id: 'data.engineering', name: 'Инженерия данных' },
    { id: 'data.analytics', name: 'Анализ данных' },
  ],
  analyst: [
    { id: 'analyst.requirements', name: 'Требования' },
    { id: 'analyst.modeling', name: 'Моделирование процессов' },
    { id: 'analyst.data', name: 'Данные и интеграции' },
  ],
}

type SkillSeed = [id: string, name: string, specs: Specialization[], competency: string, aliases: string[]]

const SKILL_SEEDS: SkillSeed[] = [
  ['python', 'Python', ['backend', 'data_ml', 'qa'], 'backend.languages', ['питон', 'пайтон', 'py']],
  ['go', 'Go', ['backend', 'devops'], 'backend.languages', ['golang', 'го', 'голанг']],
  ['java', 'Java', ['backend', 'mobile'], 'backend.languages', ['джава']],
  ['kotlin', 'Kotlin', ['backend', 'mobile'], 'backend.languages', ['котлин']],
  ['csharp', 'C#', ['backend'], 'backend.languages', ['c#', 'шарп', '.net', 'дотнет', 'dotnet']],
  ['php', 'PHP', ['backend'], 'backend.languages', ['пхп']],
  ['nodejs', 'Node.js', ['backend', 'frontend'], 'backend.languages', ['node', 'нода', 'node.js', 'nodejs']],
  ['postgresql', 'PostgreSQL', ['backend', 'data_ml', 'analyst'], 'backend.databases', ['postgres', 'постгрес', 'постгре', 'pg', 'postgre']],
  ['mysql', 'MySQL', ['backend'], 'backend.databases', ['мускул']],
  ['mongodb', 'MongoDB', ['backend'], 'backend.databases', ['mongo', 'монго']],
  ['redis', 'Redis', ['backend', 'devops'], 'backend.databases', ['редис']],
  ['clickhouse', 'ClickHouse', ['backend', 'data_ml', 'analyst'], 'backend.databases', ['кликхаус', 'ch']],
  ['sql', 'SQL', ['backend', 'data_ml', 'analyst', 'qa'], 'backend.databases', ['эскуэль', 'sql-запросы']],
  ['kafka', 'Kafka', ['backend', 'data_ml'], 'backend.messaging', ['кафка', 'apache kafka']],
  ['rabbitmq', 'RabbitMQ', ['backend'], 'backend.messaging', ['rabbit', 'кролик', 'рэббит']],
  ['grpc', 'gRPC', ['backend'], 'backend.messaging', ['грпц']],
  ['rest', 'REST API', ['backend', 'frontend', 'analyst', 'qa'], 'backend.messaging', ['rest', 'restapi', 'рест']],
  ['microservices', 'Микросервисы', ['backend'], 'backend.architecture', ['микросервисы', 'микросервисная архитектура', 'microservices']],
  ['system_design', 'System design', ['backend'], 'backend.architecture', ['системный дизайн', 'проектирование систем', 'архитектура']],
  ['django', 'Django', ['backend'], 'backend.languages', ['джанго']],
  ['fastapi', 'FastAPI', ['backend'], 'backend.languages', ['фастапи']],
  ['spring', 'Spring Boot', ['backend'], 'backend.languages', ['spring', 'спринг']],
  ['observability_be', 'Логи и трассировка', ['backend'], 'backend.reliability', ['трассировка', 'opentelemetry', 'otel']],
  ['docker', 'Docker', ['backend', 'devops', 'qa'], 'devops.orchestration', ['докер']],
  ['kubernetes', 'Kubernetes', ['backend', 'devops'], 'devops.orchestration', ['k8s', 'кубер', 'кубернетес', 'кубернетис']],
  ['linux', 'Linux', ['backend', 'devops'], 'devops.orchestration', ['линукс']],
  ['git', 'Git', ['backend', 'frontend', 'mobile', 'devops', 'qa'], 'devops.ci', ['гит']],
  ['javascript', 'JavaScript', ['frontend'], 'frontend.core', ['js', 'джаваскрипт', 'es6']],
  ['typescript', 'TypeScript', ['frontend', 'backend'], 'frontend.core', ['ts', 'тайпскрипт']],
  ['react', 'React', ['frontend'], 'frontend.frameworks', ['реакт', 'react.js', 'reactjs']],
  ['vue', 'Vue', ['frontend'], 'frontend.frameworks', ['vue.js', 'вью', 'vuejs']],
  ['angular', 'Angular', ['frontend'], 'frontend.frameworks', ['ангуляр']],
  ['nextjs', 'Next.js', ['frontend'], 'frontend.frameworks', ['next', 'некст']],
  ['redux', 'Redux', ['frontend'], 'frontend.frameworks', ['редакс']],
  ['html_css', 'HTML/CSS', ['frontend'], 'frontend.layout', ['html', 'css', 'вёрстка', 'верстка']],
  ['a11y', 'Доступность (a11y)', ['frontend'], 'frontend.layout', ['доступность', 'a11y', 'wcag']],
  ['web_performance', 'Web performance', ['frontend'], 'frontend.performance', ['производительность фронтенда', 'core web vitals', 'web vitals']],
  ['webpack', 'Webpack', ['frontend'], 'frontend.performance', ['вебпак']],
  ['vite', 'Vite', ['frontend'], 'frontend.performance', ['вит']],
  ['jest', 'Jest', ['frontend'], 'frontend.testing', ['джест']],
  ['playwright', 'Playwright', ['frontend', 'qa'], 'frontend.testing', ['плейрайт']],
  ['cypress', 'Cypress', ['frontend', 'qa'], 'frontend.testing', ['сайпресс']],
  ['swift', 'Swift', ['mobile'], 'mobile.ios', ['свифт']],
  ['swiftui', 'SwiftUI', ['mobile'], 'mobile.ios', ['свифтюай']],
  ['android_sdk', 'Android SDK', ['mobile'], 'mobile.android', ['android', 'андроид']],
  ['jetpack_compose', 'Jetpack Compose', ['mobile'], 'mobile.android', ['compose', 'компоуз']],
  ['flutter', 'Flutter', ['mobile'], 'mobile.cross', ['флаттер', 'dart', 'дарт']],
  ['react_native', 'React Native', ['mobile', 'frontend'], 'mobile.cross', ['react native', 'rn', 'реакт нейтив']],
  ['test_design', 'Тест-дизайн', ['qa'], 'qa.design', ['тест-дизайн', 'тест-кейсы', 'тест кейсы', 'чек-листы']],
  ['api_testing', 'Тестирование API', ['qa'], 'qa.automation', ['postman', 'постман', 'тестирование api']],
  ['selenium', 'Selenium', ['qa'], 'qa.automation', ['селениум']],
  ['pytest', 'pytest', ['qa', 'backend'], 'qa.automation', ['пайтест']],
  ['load_testing', 'Нагрузочное тестирование', ['qa', 'devops'], 'qa.performance', ['jmeter', 'locust', 'k6', 'нагрузочное', 'нагрузка']],
  ['ci_cd', 'CI/CD', ['devops', 'backend', 'qa'], 'devops.ci', ['ci', 'cd', 'gitlab ci', 'github actions', 'ci/cd']],
  ['terraform', 'Terraform', ['devops'], 'devops.iac', ['терраформ']],
  ['ansible', 'Ansible', ['devops'], 'devops.iac', ['ансибл']],
  ['helm', 'Helm', ['devops'], 'devops.orchestration', ['хелм']],
  ['prometheus', 'Prometheus', ['devops', 'backend'], 'devops.observability', ['прометеус', 'прометей']],
  ['grafana', 'Grafana', ['devops'], 'devops.observability', ['графана']],
  ['nginx', 'Nginx', ['devops', 'backend'], 'devops.orchestration', ['энджинкс', 'нджинкс']],
  ['yandex_cloud', 'Yandex Cloud', ['devops'], 'devops.iac', ['яндекс облако', 'yc', 'yandex cloud']],
  ['pandas', 'pandas', ['data_ml', 'analyst'], 'data.analytics', ['пандас']],
  ['numpy', 'NumPy', ['data_ml'], 'data.analytics', ['нампай']],
  ['sklearn', 'scikit-learn', ['data_ml'], 'data.ml', ['sklearn', 'склерн']],
  ['pytorch', 'PyTorch', ['data_ml'], 'data.ml', ['торч', 'torch']],
  ['ml', 'Машинное обучение', ['data_ml'], 'data.ml', ['ml', 'машинное обучение', 'machine learning']],
  ['llm', 'LLM', ['data_ml'], 'data.ml', ['llm', 'нейросети', 'gpt', 'rag']],
  ['airflow', 'Airflow', ['data_ml'], 'data.engineering', ['эйрфлоу']],
  ['spark', 'Spark', ['data_ml'], 'data.engineering', ['спарк', 'pyspark']],
  ['dwh', 'DWH', ['data_ml', 'analyst'], 'data.engineering', ['хранилище данных', 'dwh']],
  ['requirements', 'Сбор требований', ['analyst'], 'analyst.requirements', ['требования', 'сбор требований', 'тз']],
  ['bpmn', 'BPMN', ['analyst'], 'analyst.modeling', ['бпмн']],
  ['uml', 'UML', ['analyst'], 'analyst.modeling', ['юмл']],
  ['openapi_spec', 'OpenAPI', ['analyst', 'backend'], 'analyst.data', ['swagger', 'сваггер', 'openapi']],
  ['bi', 'BI-аналитика', ['analyst', 'data_ml'], 'analyst.data', ['power bi', 'tableau', 'datalens', 'бизнес-аналитика']],
]

export const SKILLS: Skill[] = SKILL_SEEDS.map(([id, name, specializations, competency_id, aliases]) => ({
  id,
  name,
  specializations,
  competency_id,
  aliases,
}))

export const SKILL_BY_ID = new Map(SKILLS.map((s) => [s.id, s]))

export function skillName(id: string): string {
  return SKILL_BY_ID.get(id)?.name ?? id
}

export function skillRef(id: string): { id: string; name: string } {
  return { id, name: skillName(id) }
}

export const SPECIALIZATION_NAMES: Record<Specialization, string> = {
  backend: 'Backend',
  frontend: 'Frontend',
  mobile: 'Mobile',
  qa: 'QA',
  devops: 'DevOps/SRE',
  data_ml: 'Data/ML',
  analyst: 'Аналитик',
}

export const INDUSTRY_NAMES: Record<Industry, string> = {
  fintech: 'Финтех',
  ecom: 'E-com',
  gov: 'Госсектор',
  telecom: 'Телеком',
  gamedev: 'Геймдев',
  edtech: 'Edtech',
  medtech: 'Медтех',
  manufacturing: 'Промышленность',
  other: 'Другое',
}

export const CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Новосибирск',
  'Екатеринбург',
  'Нижний Новгород',
  'Томск',
  'Иннополис',
  'Самара',
  'Краснодар',
  'Пермь',
  'Воронеж',
] as const

/** Стек по специализации — пул навыков для генерации кандидатов */
export const STACK_POOL: Record<Specialization, string[]> = {
  backend: ['python', 'go', 'java', 'kotlin', 'postgresql', 'redis', 'kafka', 'rabbitmq', 'grpc', 'docker', 'kubernetes', 'microservices', 'system_design', 'fastapi', 'django', 'spring', 'clickhouse', 'sql', 'linux', 'ci_cd'],
  frontend: ['javascript', 'typescript', 'react', 'vue', 'nextjs', 'redux', 'html_css', 'a11y', 'web_performance', 'vite', 'webpack', 'jest', 'playwright', 'rest'],
  mobile: ['swift', 'swiftui', 'kotlin', 'android_sdk', 'jetpack_compose', 'flutter', 'react_native', 'git', 'rest'],
  qa: ['test_design', 'api_testing', 'python', 'pytest', 'selenium', 'playwright', 'sql', 'load_testing', 'ci_cd', 'docker'],
  devops: ['linux', 'docker', 'kubernetes', 'helm', 'terraform', 'ansible', 'ci_cd', 'prometheus', 'grafana', 'nginx', 'yandex_cloud', 'go', 'python'],
  data_ml: ['python', 'pandas', 'numpy', 'sklearn', 'pytorch', 'ml', 'llm', 'sql', 'airflow', 'spark', 'clickhouse', 'dwh'],
  analyst: ['requirements', 'bpmn', 'uml', 'sql', 'openapi_spec', 'rest', 'bi', 'postgresql', 'dwh'],
}

export function buildTaxonomy(): Taxonomy {
  return {
    specializations: (Object.keys(COMPETENCIES) as Specialization[]).map((id) => ({
      id,
      name: SPECIALIZATION_NAMES[id],
      competencies: COMPETENCIES[id],
    })),
    grades: [
      { id: 'junior', name: 'Junior', experience: 'до 1 года' },
      { id: 'middle', name: 'Middle', experience: '1–3 года' },
      { id: 'senior', name: 'Senior', experience: '3–6 лет' },
      { id: 'lead', name: 'Lead', experience: '6+ лет' },
    ],
    industries: (Object.keys(INDUSTRY_NAMES) as Industry[]).map((id) => ({ id, name: INDUSTRY_NAMES[id] })),
    skills: SKILLS,
    cities: [...CITIES],
  }
}

/** Компетенция по id навыка (для бланков теста и подтверждённых навыков). */
export function competencyName(id: string): string {
  for (const list of Object.values(COMPETENCIES)) {
    const found = list.find((c) => c.id === id)
    if (found) return found.name
  }
  return id
}
