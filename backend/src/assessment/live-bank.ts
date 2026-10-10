import type { Specialization, TestItem } from '../contract/model/index.js';
import { seededRandom, type Family } from '../common/cat.ts';
import type { ExpectedAnswer } from './grading.ts';
import { choiceFamilies } from './choice-bank.ts';

interface NumericVariant { parameters: Record<string, number>; prompt: string; value: number; tolerance?: number; options?: never }
export interface ChoiceVariant { parameters: Record<string, number>; prompt: string; type: 'single_choice' | 'multiple_choice'; options: { id: string; text: string }[]; correctIds: string[]; value?: never; tolerance?: never }
type Variant = NumericVariant | ChoiceVariant;
export const LIVE_BANK_VERSION = 'expert-bank-20261010-v4';
export interface LiveFamily extends Family {
  title: string;
  specializations: readonly Specialization[];
  skillIds: readonly string[];
  templateVersion: number;
  calibration: 'expert_prior';
  generate: (seed: number) => Variant;
}
const all: readonly Specialization[] = ['backend', 'frontend', 'mobile', 'qa', 'devops', 'data_ml', 'analyst'];
const draw = (seed: number) => {
  const random = seededRandom(seed);
  return (from: number, to: number) => from + Math.floor(random() * (to - from + 1));
};
const pick = <T>(n: (from: number, to: number) => number, items: readonly T[]): T => items[n(0, items.length - 1)];
const R2 = 0.00500001, R3 = 0.000500001;
function family(id: string, title: string, competency: string, b: number, specializations: readonly Specialization[], generate: LiveFamily['generate'], skillIds: readonly string[] = []): LiveFamily {
  return { id, title, competency, a: 1.2, b, specializations, skillIds, templateVersion: 1, calibration: 'expert_prior', generate };
}

/** Versioned parameterized objective families. These priors are NOT empirical calibration. */
export const LIVE_BANK: readonly LiveFamily[] = [
  ...choiceFamilies,
  family('live-sql-count-null', 'COUNT и NULL', 'databases', -1, ['backend', 'qa', 'data_ml', 'analyst'], seed => {
    const n = draw(seed), rows = n(20, 200), nulls = n(1, rows - 1);
    return { parameters: { rows, nulls }, prompt: `В таблице ${rows} строк. В ${nulls} строках поле value равно NULL, в остальных содержит число. Что вернёт SELECT COUNT(value) FROM events?`, value: rows - nulls };
  }, ['postgresql']),
  family('live-sql-join-multiplicity', 'Размер результата JOIN', 'databases', 0.4, ['backend', 'qa', 'data_ml', 'analyst'], seed => {
    const n = draw(seed), a = n(2, 9), b = n(2, 8), c = n(1, 7), d = n(1, 6);
    return { parameters: { a, b, c, d }, prompt: `INNER JOIN по key: в левой таблице ${a} строк с key=1 и ${c} с key=2; в правой ${b} с key=1 и ${d} с key=2. Других строк нет. Сколько строк в результате?`, value: a * b + c * d };
  }, ['postgresql']),
  family('live-queue-drain', 'Время опустошения очереди', 'systems', -0.4, all, seed => {
    const n = draw(seed), backlog = n(50, 500), input = n(1, 20), output = input + n(1, 15);
    return { parameters: { backlog, input, output }, prompt: `Очередь содержит ${backlog} задач. За каждую секунду сначала приходит ${input} задач, затем обработчик завершает до ${output}. Сколько целых секунд нужно до первого опустошения очереди?`, value: Math.ceil(backlog / (output - input)) };
  }),
  family('live-token-bucket', 'Ограничитель token bucket', 'systems', 0.6, ['backend', 'frontend', 'mobile', 'qa', 'devops'], seed => {
    const n = draw(seed), capacity = n(10, 40), tokens = n(0, capacity), rate = n(1, 8), seconds = n(1, 8), requests = n(5, 60);
    return { parameters: { capacity, tokens, rate, seconds, requests }, prompt: `Token bucket: ёмкость ${capacity}, сейчас ${tokens} токенов, пополнение ${rate}/с. Запросов нет ${seconds} секунд, затем одновременно поступает ${requests} запросов по одному токену. Сколько запросов будут допущены?`, value: Math.min(requests, capacity, tokens + rate * seconds) };
  }),
  family('live-ci-critical-path', 'Критический путь CI', 'systems', -0.2, all, seed => {
    const n = draw(seed), setup = n(1, 8), tests = n(3, 15), build = n(3, 15), deploy = n(1, 6);
    return { parameters: { setup, tests, build, deploy }, prompt: `CI: подготовка ${setup} минут. После неё тесты (${tests} минут) и сборка (${build} минут) идут параллельно. Деплой (${deploy} минут) начинается после обеих задач. Ресурсы не ограничены. Через сколько минут всё завершится?`, value: setup + Math.max(tests, build) + deploy };
  }),
  family('live-test-cartesian', 'Полное покрытие конфигураций', 'quality', -0.8, all, seed => {
    const n = draw(seed), browsers = n(2, 12), platforms = n(2, 8), roles = n(2, 15), locales = n(1, 6);
    return { parameters: { browsers, platforms, roles, locales }, prompt: `Проверяются все комбинации ${browsers} браузеров, ${platforms} платформ, ${roles} ролей и ${locales} локалей. Один тест покрывает ровно одну комбинацию. Сколько тестов нужно для полного, а не попарного покрытия?`, value: browsers * platforms * roles * locales };
  }),
  family('live-inclusive-boundaries', 'Граничные значения диапазона', 'quality', -1.2, all, seed => {
    const n = draw(seed), low = n(1, 50), high = low + n(5, 60);
    return { parameters: { low, high }, prompt: `Валидация принимает целые x при ${low} <= x <= ${high}. Сколько различных целых значений допустимо?`, value: high - low + 1 };
  }),
  family('live-slo-budget', 'Бюджет недоступности', 'systems', 0.3, ['backend', 'qa', 'devops', 'analyst'], seed => {
    const n = draw(seed), days = n(7, 30), permittedTenthsPercent = n(1, 9);
    const availability = 100 - permittedTenthsPercent / 10;
    return { parameters: { days, permittedTenthsPercent }, prompt: `SLO доступности ${availability.toFixed(1)}% за ${days} суток (сутки = 24 часа). Какой бюджет недоступности в минутах? Ответ округлите до двух знаков после запятой.`, value: days * 1440 * permittedTenthsPercent / 1000, tolerance: 0.00500001 };
  }),
  family('live-weighted-mean', 'Объединение средних', 'data_reasoning', 0, all, seed => {
    const n = draw(seed), firstCount = n(2, 10), secondCount = n(2, 10), firstMean = n(10, 90), secondMean = n(10, 90);
    return { parameters: { firstCount, secondCount, firstMean, secondMean }, prompt: `В первой группе ${firstCount} наблюдений со средним ${firstMean}, во второй ${secondCount} со средним ${secondMean}. Чему равно среднее объединённой выборки? Округлите до двух знаков.`, value: (firstCount * firstMean + secondCount * secondMean) / (firstCount + secondCount), tolerance: 0.00500001 };
  }),
  family('live-f1-score', 'F1 по матрице ошибок', 'data_reasoning', 0.8, ['qa', 'data_ml', 'analyst'], seed => {
    const n = draw(seed), tp = n(10, 70), fp = n(1, 30), fn = n(1, 30);
    return { parameters: { tp, fp, fn }, prompt: `Бинарный классификатор: TP=${tp}, FP=${fp}, FN=${fn}. Вычислите F1 положительного класса в процентах. Округлите до двух знаков.`, value: 200 * tp / (2 * tp + fp + fn), tolerance: 0.00500001 };
  }),
  family('live-loop-pairs', 'Число итераций вложенного цикла', 'algorithms', 0.2, all, seed => {
    const n = draw(seed), size = n(20, 4000);
    return { parameters: { size }, prompt: `Внешний цикл перебирает i от 0 до ${size - 1} включительно. Внутренний перебирает j от 0 до i-1 включительно (при i=0 не выполняется). Сколько раз выполнится тело внутреннего цикла?`, value: size * (size - 1) / 2 };
  }),
  family('live-binary-tree-height', 'Нижний уровень полного дерева', 'algorithms', 0.5, ['backend', 'frontend', 'mobile', 'qa', 'data_ml'], seed => {
    const n = draw(seed), nodes = n(20, 5000);
    let levels = 1;
    while (2 ** levels - 1 < nodes) levels++;
    return { parameters: { levels, nodes }, prompt: `Полное (complete) бинарное дерево содержит ${nodes} узлов: все уровни, кроме нижнего, заполнены целиком, нижний заполняется слева направо. Сколько узлов на нижнем уровне?`, value: nodes - (2 ** (levels - 1) - 1) };
  }),
  family('live-css-box-width', 'Ширина CSS box model', 'interface', -0.1, ['frontend', 'qa'], seed => {
    const n = draw(seed), width = n(100, 400), padding = n(5, 25), border = n(1, 5), borderBox = n(0, 1);
    return { parameters: { width, padding, border, borderBox }, prompt: `CSS: width:${width}px; padding:${padding}px; border:${border}px solid; box-sizing:${borderBox ? 'border-box' : 'content-box'}. margin:0, min/max-width не заданы. Какова внешняя ширина элемента в px, включая padding и border?`, value: borderBox ? width : width + 2 * (padding + border) };
  }),
  family('live-mobile-density', 'Преобразование dp в px', 'interface', -0.5, ['mobile', 'frontend', 'qa'], seed => {
    const n = draw(seed), dp = n(10, 100), density = n(1, 4);
    return { parameters: { dp, density }, prompt: `Масштаб экрана ${density} px на 1 dp. Элемент шириной ${dp} dp. Какова ширина в физических пикселях?`, value: dp * density };
  }),
  family('live-worker-batches', 'Пакетная обработка', 'systems', -0.3, ['backend', 'mobile', 'qa', 'devops'], seed => {
    const n = draw(seed), requests = n(20, 100), workers = n(2, 10), duration = n(2, 9);
    return { parameters: { requests, workers, duration }, prompt: `${requests} задач готовы в момент 0. Есть ${workers} одинаковых worker, каждый обрабатывает одну задачу за ${duration} секунд без накладных расходов. Каково минимальное время до завершения всех задач в секундах?`, value: Math.ceil(requests / workers) * duration };
  }),
  family('live-js-event-loop-order', 'Порядок event loop', 'algorithms', 0.2, ['frontend', 'backend'], seed => {
    const n = draw(seed), sync = n(1, 400), micro = n(1, 400);
    return { parameters: { sync, micro }, prompt: `Скрипт сначала вызывает setTimeout(() => console.log('T'), 0), затем в цикле ${micro} раз Promise.resolve().then(() => console.log('P')), затем ${sync} раз синхронно console.log('S'). Каким по счёту (с 1) будет выведено 'T'?`, value: sync + micro + 1 };
  }, ['javascript']),
  family('live-debounce-calls', 'Вызовы debounce', 'interface', -1.1, ['frontend'], seed => {
    const n = draw(seed), bursts = n(2, 12), presses = n(3, 15), delay = pick(n, [150, 200, 300, 400]), pause = delay + n(1, 20) * 50;
    return { parameters: { bursts, presses, delay, pause }, prompt: `Обработчик ввода обёрнут в debounce(fn, ${delay}) — вызов после паузы. Пользователь делает ${bursts} серий по ${presses} нажатий с интервалом 50 мс внутри серии, между сериями пауза ${pause} мс. Сколько раз вызовется fn?`, value: bursts };
  }, ['javascript']),
  family('live-throttle-calls', 'Вызовы throttle', 'interface', 0.6, ['frontend'], seed => {
    const n = draw(seed), step = pick(n, [10, 16, 20, 25]), k = n(2, 8), count = n(10, 80), window = step * k;
    return { parameters: { step, window, count }, prompt: `Событие scroll приходит каждые ${step} мс, всего ${count} событий, первое в момент 0. Обработчик обёрнут в throttle на ${window} мс: срабатывает на событии, если с прошлого срабатывания прошло не меньше ${window} мс, отложенного (trailing) вызова нет. Сколько раз выполнится обработчик?`, value: Math.floor((count - 1) / k) + 1 };
  }, ['javascript']),
  family('live-flex-grow', 'Распределение flex-grow', 'interface', 0.5, ['frontend'], seed => {
    const n = draw(seed), b1 = n(5, 30) * 10, b2 = n(5, 30) * 10, b3 = n(5, 30) * 10, g1 = n(1, 3), g2 = n(1, 3), g3 = n(1, 3), unit = n(5, 40), width = b1 + b2 + b3 + (g1 + g2 + g3) * unit;
    return { parameters: { width, b1, b2, b3, g1, g2, g3 }, prompt: `Flex-контейнер шириной ${width}px, gap 0, у элементов padding, border и margin нулевые. Три элемента: flex-basis ${b1}/${b2}/${b3}px, flex-grow ${g1}/${g2}/${g3}. Какой будет ширина первого элемента в px?`, value: b1 + g1 * unit };
  }, ['html_css']),
  family('live-flex-shrink', 'Сжатие flex-shrink', 'interface', 1.4, ['frontend'], seed => {
    const n = draw(seed), b1 = n(10, 40) * 10, b2 = n(10, 40) * 10, b3 = n(10, 40) * 10, s1 = n(1, 3), s2 = n(1, 3), s3 = n(1, 3), sum = b1 + b2 + b3, deficit = n(20, Math.floor(sum * 0.3)), width = sum - deficit;
    return { parameters: { width, b1, b2, b3, s1, s2, s3 }, prompt: `Flex-контейнер шириной ${width}px, gap 0, у элементов min-width: 0 и нулевые padding/border/margin. Три элемента: flex-basis ${b1}/${b2}/${b3}px, flex-shrink ${s1}/${s2}/${s3}, flex-grow 0. Какой станет ширина первого элемента в px? Округлите до двух знаков.`, value: b1 - deficit * s1 * b1 / (s1 * b1 + s2 * b2 + s3 * b3), tolerance: R2 };
  }, ['html_css']),
  family('live-grid-fr', 'Колонки grid в fr', 'interface', 0.3, ['frontend'], seed => {
    const n = draw(seed), fixed = n(5, 30) * 10, a = n(1, 3), c = n(1, 4), gap = n(0, 4) * 8, unit = n(20, 80), width = fixed + 2 * gap + (a + c) * unit;
    return { parameters: { fixed, a, c, gap, width }, prompt: `grid-template-columns: ${fixed}px ${a}fr ${c}fr; column-gap: ${gap}px; ширина контейнера ${width}px, padding 0, содержимое ячеек не шире колонок. Какова ширина третьей колонки в px?`, value: c * unit };
  }, ['html_css']),
  family('live-react-memo-renders', 'Рендеры и React.memo', 'interface', 0.9, ['frontend'], seed => {
    const n = draw(seed), updates = n(1, 400), stable = n(0, 1), plains = n(1, 9);
    return { parameters: { updates, stable, plains }, prompt: `Production-сборка React без StrictMode. Parent после монтирования ещё ${updates} раз перерисовывается из-за своего setState. Он рендерит ${plains} экземпляр(ов) <Plain /> без memo (с разными key) и <Child config={${stable ? 'CONFIG' : '{ size: 1 }'}} />, где Child обёрнут в React.memo${stable ? ', а CONFIG — константа уровня модуля' : ''}. Контекстов нет. Сколько раз суммарно выполнятся функции Plain и Child, включая монтирование?`, value: plains * (updates + 1) + (stable ? 1 : updates + 1) };
  }, ['react']),
  family('live-css-specificity', 'Специфичность селектора', 'interface', 0.4, ['frontend'], seed => {
    const n = draw(seed), ids = n(0, 2), classes = n(0, 4), attrs = n(0, 1), elements = n(1, 4);
    const tags = ['nav', 'ul', 'li', 'a'].slice(0, elements), names = ['menu', 'top'], cls = ['item', 'active', 'open', 'wide'];
    const selector = [tags[0], ...names.slice(0, ids).map(x => `#${x}`), ...cls.slice(0, classes).map(x => `.${x}`), ...(attrs ? ['[data-state]'] : []), ...tags.slice(1)].join(' ');
    return { parameters: { ids, classes, attrs, elements }, prompt: `Специфичность селектора «${selector}» записывается как (a, b, c). Введите число 100·a + 10·b + c.`, value: 100 * ids + 10 * (classes + attrs) + elements };
  }, ['html_css']),
  family('live-css-em-rem', 'Вычисление em и rem', 'interface', 0.8, ['frontend'], seed => {
    const n = draw(seed), root = pick(n, [10, 16, 20]), parent = pick(n, [1.25, 1.5, 2]), child = pick(n, [0.5, 0.75, 1.5]), padding = pick(n, [1, 1.5, 2]), rem = n(0, 1);
    return { parameters: { root, parent, child, padding, rem }, prompt: `html { font-size: ${root}px }. У родителя font-size: ${parent}em, у дочернего элемента font-size: ${child}em и padding-left: ${padding}${rem ? 'rem' : 'em'}. Сколько px составит padding-left? Округлите до двух знаков.`, value: rem ? padding * root : padding * root * parent * child, tolerance: R2 };
  }, ['html_css']),
  family('live-asset-transfer-time', 'Время передачи файла', 'systems', -0.6, ['frontend', 'mobile'], seed => {
    const n = draw(seed), bandwidth = pick(n, [4, 8, 10, 20, 40, 50, 100]), size = bandwidth * n(10, 200);
    return { parameters: { bandwidth, size }, prompt: `Файл размером ${size} КБ (1 КБ = 1000 байт) скачивается по каналу ${bandwidth} Мбит/с (1 Мбит = 10^6 бит). Без учёта задержек и заголовков: сколько миллисекунд займёт передача?`, value: size * 8 / bandwidth };
  }, ['web_performance']),
  family('live-virtual-list-rows', 'Строки виртуального списка', 'interface', 0.9, ['frontend', 'mobile'], seed => {
    const n = draw(seed), row = pick(n, [20, 24, 32, 40, 48, 56]), visible = n(5, 20), overscan = n(1, 5), first = n(0, 10);
    return { parameters: { row, visible, overscan, first }, prompt: `Виртуализированный список из 1000 строк высотой ${row}px, окно ${row * visible}px, overscan ${overscan} строк сверху и снизу (сверху — сколько есть). scrollTop = ${first * row}px. Сколько строк отрендерено?`, value: Math.min(overscan, first) + visible + overscan };
  }),
  family('live-frame-budget', 'Бюджет кадра', 'interface', -0.9, ['frontend', 'mobile'], seed => {
    const n = draw(seed), fps = pick(n, [30, 60, 90, 120]), used = n(1, Math.floor(1000 / fps) - 1);
    return { parameters: { fps, used }, prompt: `Частота обновления экрана ${fps} Гц. Стили, layout и отрисовка занимают ${used} мс на кадр. Сколько мс остаётся на логику приложения, чтобы не пропустить кадр? Округлите до двух знаков.`, value: 1000 / fps - used, tolerance: R2 };
  }, ['web_performance']),
  family('live-dropped-frames', 'Отрисованные кадры', 'interface', -1, ['mobile', 'frontend'], seed => {
    const n = draw(seed), hz = pick(n, [60, 90, 120]), seconds = n(1, 10), dropped = n(1, 5) * 10;
    return { parameters: { hz, seconds, dropped }, prompt: `Анимация длится ${seconds} с на экране ${hz} Гц. Пропущено ${dropped}% кадров. Сколько кадров отрисовано?`, value: hz * seconds * (100 - dropped) / 100 };
  }),
  family('live-srcset-choice', 'Выбор кандидата srcset', 'interface', 0, ['frontend'], seed => {
    const n = draw(seed), width = pick(n, [160, 200, 240, 320, 360, 400]), dpr = pick(n, [1, 1.5, 2, 3]), candidates = [320, 480, 640, 800, 1024, 1280, 1600];
    return { parameters: { width, dpr }, prompt: `<img srcset="img-320.jpg 320w, img-480.jpg 480w, img-640.jpg 640w, img-800.jpg 800w, img-1024.jpg 1024w, img-1280.jpg 1280w, img-1600.jpg 1600w" sizes="${width}px">, devicePixelRatio = ${dpr}. Браузер берёт наименьший кандидат, который не уже требуемой ширины в физических пикселях. Какую ширину (w) он загрузит?`, value: candidates.find(c => c >= width * dpr)! };
  }, ['html_css', 'web_performance']),
  family('live-closure-var-let', 'Замыкания в цикле', 'algorithms', 0.9, ['frontend', 'backend'], seed => {
    const n = draw(seed), count = n(3, 12), block = n(0, 1);
    return { parameters: { count, block }, prompt: `Код: let sum = 0; for (${block ? 'let' : 'var'} i = 0; i < ${count}; i++) setTimeout(() => { sum += i; }, 0); Чему равен sum после выполнения всех таймеров?`, value: block ? count * (count - 1) / 2 : count * count };
  }, ['javascript']),
  family('live-async-await-time', 'Последовательный и параллельный await', 'systems', -0.4, ['frontend', 'backend'], seed => {
    const n = draw(seed), a = n(1, 20) * 10, b = n(1, 20) * 10, c = n(1, 20) * 10, parallel = n(0, 1);
    return { parameters: { a, b, c, parallel }, prompt: `Три запроса отвечают за ${a}, ${b} и ${c} мс, сеть не ограничивает параллельность. Код: ${parallel ? 'await Promise.all(urls.map(u => fetch(u)))' : 'for (const u of urls) await fetch(u)'}. Через сколько мс завершится код (накладными расходами пренебречь)?`, value: parallel ? Math.max(a, b, c) : a + b + c };
  }, ['javascript']),
  family('live-grid-auto-fill', 'Колонки auto-fill', 'interface', 1.2, ['frontend'], seed => {
    const n = draw(seed), min = pick(n, [120, 150, 160, 180, 200, 240]), gap = pick(n, [0, 8, 12, 16, 24]), width = n(400, 1400);
    return { parameters: { min, gap, width }, prompt: `grid-template-columns: repeat(auto-fill, minmax(${min}px, 1fr)); column-gap: ${gap}px; ширина контейнера ${width}px, padding 0. Сколько колонок будет в строке?`, value: Math.floor((width + gap) / (min + gap)) };
  }, ['html_css']),
  family('live-percent-padding', 'Процентный padding', 'interface', 1, ['frontend'], seed => {
    const n = draw(seed), container = n(10, 60) * 20, own = n(5, container / 20) * 10, percent = n(1, 20) * 5;
    return { parameters: { container, own, percent }, prompt: `Контейнер шириной ${container}px (content-box, padding 0). Внутри блочный элемент шириной ${own}px с padding-top: ${percent}%. Сколько px составит padding-top?`, value: container * percent / 100 };
  }, ['html_css']),
  family('live-margin-collapse', 'Схлопывание margin', 'interface', 0.7, ['frontend'], seed => {
    const n = draw(seed), bottom = n(1, 8) * 5, top = n(1, 8) * 5, negative = n(0, 1), second = negative ? -top : top;
    return { parameters: { bottom, second }, prompt: `Два соседних блочных элемента в обычном потоке (родитель не flex/grid, без float). У первого margin-bottom: ${bottom}px, у второго margin-top: ${second}px. Каким будет расстояние между ними по вертикали в px (отрицательное — перекрытие)?`, value: negative ? bottom + second : Math.max(bottom, second) };
  }, ['html_css']),
  family('live-react-batching', 'Батчинг setState', 'interface', 1.1, ['frontend'], seed => {
    const n = draw(seed), initial = n(0, 9), plain = n(1, 5), functional = n(0, 6);
    return { parameters: { initial, plain, functional }, prompt: `React 18, count = ${initial}. В одном обработчике клика ${plain} раз вызывается setCount(count + 1), затем ${functional} раз setCount(c => c + 1). Чему равен count после ререндера?`, value: initial + 1 + functional };
  }, ['react']),
  family('live-useeffect-runs', 'Запуски useEffect', 'interface', -1.2, ['frontend'], seed => {
    const n = draw(seed), renders = n(2, 20), changes = n(0, renders);
    return { parameters: { renders, changes }, prompt: `Production без StrictMode. useEffect(fn, [userId]). После монтирования компонент перерисовался ${renders} раз, userId менялся в ${changes} из них. Сколько раз выполнится fn, включая монтирование?`, value: 1 + changes };
  }, ['react']),
  family('live-cls-score', 'Layout shift score', 'interface', 1.6, ['frontend'], seed => {
    const n = draw(seed), width = pick(n, [360, 390, 412]), height = pick(n, [600, 700, 800, 900, 1000]), element = n(1, 8) * 50, shift = n(1, 6) * 20;
    return { parameters: { width, height, element, shift }, prompt: `Вьюпорт ${width}×${height}px (ширина × высота). Элемент на всю ширину высотой ${element}px стоит вверху вьюпорта и сдвигается вниз на ${shift}px. Каков layout shift score (impact fraction × distance fraction)? Округлите до трёх знаков.`, value: (element + shift) * shift / (height * height), tolerance: R3 };
  }, ['web_performance']),
  family('live-cache-control-fresh', 'Свежесть HTTP-кэша', 'systems', -1.6, ['frontend', 'backend', 'mobile'], seed => {
    const n = draw(seed), maxAge = n(1, 60) * 60, age = n(0, maxAge - 1);
    return { parameters: { maxAge, age }, prompt: `Ответ пришёл с Cache-Control: max-age=${maxAge} и заголовком Age: ${age}. Сколько ещё секунд клиентский кэш будет считать его свежим?`, value: maxAge - age };
  }, ['rest']),
  family('live-cidr-hosts', 'Адреса в подсети CIDR', 'systems', -0.3, ['devops', 'backend'], seed => {
    const n = draw(seed), prefix = n(16, 28), aws = n(0, 1), total = 2 ** (32 - prefix);
    return { parameters: { prefix, aws }, prompt: aws ? `Подсеть AWS VPC с маской /${prefix}. AWS резервирует 5 адресов в каждой подсети. Сколько адресов доступно для ресурсов?` : `Подсеть IPv4 /${prefix}. Сколько адресов можно назначить хостам (без адреса сети и широковещательного)?`, value: total - (aws ? 5 : 2) };
  }),
  family('live-cron-runs', 'Частота cron', 'systems', 0.2, ['devops', 'backend'], seed => {
    const n = draw(seed), step = pick(n, [1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30]), from = n(0, 12), to = from + n(0, 11), weekdays = n(0, 1);
    return { parameters: { step, from, to, weekdays }, prompt: `Cron-выражение «*/${step} ${from}-${to} * * ${weekdays ? '1-5' : '*'}». Сколько раз задача запустится за полную календарную неделю?`, value: 60 / step * (to - from + 1) * (weekdays ? 5 : 7) };
  }, ['linux']),
  family('live-retry-backoff', 'Экспоненциальный backoff', 'systems', 0.4, ['backend', 'mobile', 'frontend', 'devops'], seed => {
    const n = draw(seed), base = pick(n, [100, 200, 250, 500]), retries = n(2, 7), cap = base * pick(n, [4, 8, 16, 32]);
    let total = 0;
    for (let i = 0; i < retries; i++) total += Math.min(base * 2 ** i, cap);
    return { parameters: { base, retries, cap }, prompt: `Клиент повторяет неудавшийся запрос до ${retries} раз. Перед i-м повтором (i = 1..${retries}) ждёт min(${base}·2^(i−1), ${cap}) мс, без jitter. Все попытки неудачны, сами запросы мгновенны. Сколько мс клиент суммарно прождёт?`, value: total };
  }),
  family('live-cache-hit-latency', 'Средняя задержка с кэшем', 'systems', -0.5, ['backend', 'frontend', 'mobile', 'devops'], seed => {
    const n = draw(seed), cacheMs = n(1, 9), dbMs = n(2, 30) * 10, hit = n(1, 9) * 10;
    return { parameters: { cacheMs, dbMs, hit }, prompt: `Запрос сначала идёт в кэш (${cacheMs} мс). При промахе дополнительно идёт в БД (${dbMs} мс). Доля попаданий ${hit}%. Какова средняя задержка в мс?`, value: cacheMs + (100 - hit) * dbMs / 100 };
  }),
  family('live-percentile-nearest', 'Перцентиль nearest-rank', 'data_reasoning', 0.6, ['analyst', 'data_ml', 'qa', 'devops', 'backend'], seed => {
    const n = draw(seed), count = n(10, 20), p = pick(n, [50, 75, 90, 95]), values = Array.from({ length: count }, () => n(10, 500)), sorted = [...values].sort((a, b) => a - b), rank = Math.ceil(p * count / 100);
    return { parameters: { count, p, rank }, prompt: `Время ответа (мс) в ${count} запросах: ${values.join(', ')}. Найдите p${p} методом nearest-rank: значение с рангом ⌈${p}/100·N⌉ в ряду, отсортированном по возрастанию.`, value: sorted[rank - 1] };
  }),
  family('live-median', 'Медиана', 'data_reasoning', -1.4, ['analyst', 'data_ml'], seed => {
    const n = draw(seed), count = n(5, 10), values = Array.from({ length: count }, () => n(1, 99)), sorted = [...values].sort((a, b) => a - b), mid = Math.floor(count / 2);
    return { parameters: { count }, prompt: `Найдите медиану чисел: ${values.join(', ')}.`, value: count % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2 };
  }),
  family('live-amdahl', 'Закон Амдала', 'systems', 1.4, ['backend', 'devops', 'data_ml'], seed => {
    const n = draw(seed), parallel = n(50, 95), cores = pick(n, [2, 4, 8, 16, 32]);
    return { parameters: { parallel, cores }, prompt: `Доля работы, которую можно распараллелить, — ${parallel}%, ядер ${cores}. Во сколько раз ускорится выполнение по закону Амдала? Округлите до двух знаков.`, value: 1 / ((100 - parallel) / 100 + parallel / 100 / cores), tolerance: R2 };
  }, ['system_design']),
  family('live-flaky-suite', 'Нестабильные тесты', 'quality', 0.9, ['qa', 'devops', 'frontend', 'mobile'], seed => {
    const n = draw(seed), total = n(20, 300), flaky = n(2, 15), q = pick(n, [0.5, 1, 2, 3, 5]);
    return { parameters: { total, flaky, q }, prompt: `В наборе ${total} тестов, из них ${flaky} нестабильных: каждый независимо падает с вероятностью ${q}%, остальные всегда проходят. Какова вероятность (в %) полностью зелёного прогона? Округлите до двух знаков.`, value: 100 * (1 - q / 100) ** flaky, tolerance: R2 };
  }, ['test_design']),
  family('live-dp-from-dpi', 'Пиксели в dp', 'interface', -0.7, ['mobile'], seed => {
    const n = draw(seed), dpi = pick(n, [160, 240, 320, 480, 640]), dp = n(2, 64) * 2;
    return { parameters: { dpi, dp }, prompt: `Экран ${dpi} dpi (базовая плотность Android — 160 dpi). Элемент занимает ${dp * dpi / 160} физических пикселей. Сколько это dp?`, value: dp };
  }, ['android_sdk']),
  family('live-sp-font-scale', 'Размер текста в sp', 'interface', 0.3, ['mobile'], seed => {
    const n = draw(seed), sp = pick(n, [12, 14, 16, 18, 20, 24]), density = pick(n, [1.5, 2, 2.625, 3, 3.5]), scale = pick(n, [0.85, 1, 1.15, 1.3, 1.5]);
    return { parameters: { sp, density, scale }, prompt: `Текст ${sp}sp, плотность экрана ${density} px на 1 dp, системный масштаб шрифта ${scale}. Какой размер шрифта в px? Округлите до двух знаков.`, value: sp * density * scale, tolerance: R2 };
  }, ['android_sdk']),
  family('live-apk-abi-split', 'Разбиение APK по ABI', 'systems', 0.2, ['mobile'], seed => {
    const n = draw(seed), code = n(5, 30), res = n(5, 40), lib = n(3, 25), abis = n(2, 4);
    return { parameters: { code, res, lib, abis }, prompt: `Universal APK: dex-код ${code} МБ, ресурсы ${res} МБ, нативные библиотеки по ${lib} МБ на каждую из ${abis} ABI. При разбиении по ABI устройство скачивает только библиотеки своей ABI. На сколько МБ уменьшится загрузка для одного устройства?`, value: lib * (abis - 1) };
  }, ['android_sdk']),
  family('live-battery-wakeups', 'Расход батареи на пробуждения', 'systems', 1.5, ['mobile'], seed => {
    const n = draw(seed), interval = pick(n, [5, 10, 15, 20, 30, 60]), awake = n(2, 20), current = n(5, 30) * 10;
    return { parameters: { interval, awake, current }, prompt: `Фоновая задача просыпается каждые ${interval} минут на ${awake} секунд и потребляет в это время ${current} мА сверх фона. Сколько мА·ч она расходует за сутки? Округлите до двух знаков.`, value: 1440 / interval * awake / 3600 * current, tolerance: R2 };
  }),
  family('live-bitmap-memory', 'Память под bitmap', 'systems', -0.3, ['mobile'], seed => {
    const n = draw(seed), width = pick(n, [640, 720, 1080, 1280, 1440, 1920, 2048, 4000]), height = pick(n, [480, 720, 1080, 1280, 1920, 2400, 3000]), argb = n(0, 1);
    return { parameters: { width, height, argb }, prompt: `Bitmap ${width}×${height} в формате ${argb ? 'ARGB_8888' : 'RGB_565'}. Сколько МиБ (1 МиБ = 1048576 байт) займут пиксели? Округлите до двух знаков.`, value: width * height * (argb ? 4 : 2) / 1048576, tolerance: R2 };
  }, ['android_sdk']),
  family('live-insample-size', 'Декодирование с inSampleSize', 'systems', 0.7, ['mobile'], seed => {
    const n = draw(seed), sample = pick(n, [2, 4, 8]), width = sample * n(100, 500), height = sample * n(100, 500);
    return { parameters: { sample, width, height }, prompt: `Изображение ${width}×${height} декодируется с inSampleSize = ${sample} в ARGB_8888. Сколько байт займут пиксели результата?`, value: width / sample * (height / sample) * 4 };
  }, ['android_sdk']),
  family('live-missed-vsync', 'Пропущенные vsync', 'interface', 1, ['mobile', 'frontend'], seed => {
    const n = draw(seed), hz = pick(n, [60, 90, 120]), drawn = n(17, 120), ms = drawn * hz % 1000 === 0 ? drawn + 1 : drawn;
    return { parameters: { hz, ms }, prompt: `Экран ${hz} Гц. Кадр начинают готовить сразу после vsync, подготовка занимает ${ms} мс, показ — на первом vsync после готовности. Сколько vsync-интервалов прошло без нового кадра из-за этого кадра?`, value: Math.ceil(ms * hz / 1000) - 1 };
  }),
  family('live-staged-rollout', 'Падения при staged rollout', 'quality', -0.4, ['mobile', 'qa'], seed => {
    const n = draw(seed), users = pick(n, [100000, 200000, 500000, 1000000, 2000000]), stage = pick(n, [1, 2, 5, 10, 20, 50]), crashFree = pick(n, [990, 995, 998, 999]);
    return { parameters: { users, stage, crashFree }, prompt: `Staged rollout: обновление получили ${stage}% из ${users} пользователей. Crash-free users ${crashFree / 10}%. Сколько пользователей столкнулись с падением?`, value: users * stage * (1000 - crashFree) / 100000 };
  }),
  family('live-cold-start', 'Холодный старт', 'systems', -1.2, ['mobile'], seed => {
    const n = draw(seed), process = n(50, 200), app = n(100, 600), sdk = n(30, app - 20), activity = n(100, 400), frame = n(16, 120);
    return { parameters: { process, app, sdk, activity, frame }, prompt: `Холодный старт: запуск процесса ${process} мс, Application.onCreate ${app} мс (из них ${sdk} мс — инициализация SDK аналитики), создание Activity ${activity} мс, первый кадр ${frame} мс; всё последовательно в главном потоке. Инициализацию SDK перенесли в фоновый поток, ресурсы не конкурируют. Через сколько мс после запуска появится первый кадр?`, value: process + app - sdk + activity + frame };
  }, ['android_sdk']),
  family('live-bind-per-frame', 'Привязки строк за кадр', 'systems', 1.6, ['mobile'], seed => {
    const n = draw(seed), fps = pick(n, [60, 90, 120]), overhead = n(2, 5), bind = n(100, 900);
    return { parameters: { fps, overhead, bind }, prompt: `Экран ${fps} Гц. На кадр уходит ${overhead} мс фиксированной работы, привязка одной строки списка (onBind) — ${bind} мкс. Сколько строк максимум можно привязать за кадр, не выходя из бюджета 1000/${fps} мс?`, value: Math.floor((1000000 - fps * overhead * 1000) / (fps * bind)) };
  }),
  family('live-schema-migrations', 'Пошаговые миграции схемы', 'databases', -1.6, ['mobile', 'backend'], seed => {
    const n = draw(seed), from = n(1, 20), to = from + n(1, 15);
    return { parameters: { from, to }, prompt: `База на устройстве на версии схемы ${from}, новая версия приложения ожидает ${to}. Миграции есть только пошаговые (N → N+1). Сколько миграций выполнится при обновлении?`, value: to - from };
  }),
  family('live-version-code', 'Расчёт versionCode', 'systems', -1.4, ['mobile', 'devops'], seed => {
    const n = draw(seed), major = n(1, 9), minor = n(0, 99), patch = n(0, 99);
    return { parameters: { major, minor, patch }, prompt: `versionCode считается как major·10000 + minor·100 + patch. Чему он равен для версии ${major}.${minor}.${patch}?`, value: major * 10000 + minor * 100 + patch };
  }),
  family('live-touch-target', 'Зона касания', 'interface', -0.1, ['mobile'], seed => {
    const n = draw(seed), icon = pick(n, [16, 18, 20, 24, 32]), density = pick(n, [1, 1.5, 2, 3, 4]);
    return { parameters: { icon, density }, prompt: `Иконка ${icon}×${icon} dp, минимальная зона касания 48×48 dp. Какой padding с каждой стороны нужен в физических px при плотности ${density} px на 1 dp?`, value: (48 - icon) / 2 * density };
  }, ['android_sdk']),
  family('live-sensor-bytes', 'Объём данных сенсора', 'systems', -0.5, ['mobile'], seed => {
    const n = draw(seed), hz = pick(n, [50, 100, 200, 400]), seconds = n(1, 60);
    return { parameters: { hz, seconds }, prompt: `Акселерометр пишет ${hz} отсчётов в секунду; отсчёт — три float32 и timestamp int64. Сколько КБ (1 КБ = 1000 байт) данных накопится за ${seconds} с?`, value: hz * seconds * 20 / 1000 };
  }),
  family('live-image-disk-cache', 'Вместимость кэша картинок', 'systems', -0.8, ['mobile'], seed => {
    const n = draw(seed), cache = pick(n, [50, 100, 200, 250]), image = n(60, 600);
    return { parameters: { cache, image }, prompt: `Дисковый кэш изображений ${cache} МиБ, средняя картинка ${image} КиБ, служебными данными пренебречь. Сколько картинок поместится целиком?`, value: Math.floor(cache * 1024 / image) };
  }),
  family('live-swipe-velocity', 'Скорость свайпа', 'interface', 0.5, ['mobile'], seed => {
    const n = draw(seed), density = pick(n, [1, 1.5, 2, 2.5, 3, 4]), dp = n(5, 60) * 10, ms = pick(n, [50, 80, 100, 125, 200, 250, 400, 500]);
    return { parameters: { density, dp, ms }, prompt: `Свайп прошёл ${dp * density} px за ${ms} мс на экране плотностью ${density} px на 1 dp. Какова скорость в dp/с?`, value: dp * 1000 / ms };
  }),
  family('live-lru-hits', 'Попадания в LRU-кэш', 'algorithms', 1.3, ['backend', 'mobile', 'frontend'], seed => {
    const n = draw(seed), capacity = n(2, 4), keys = capacity + n(1, 2), length = n(8, 12), sequence = Array.from({ length }, () => 'ABCDEF'[n(0, keys - 1)]);
    const cache: string[] = [];
    let hits = 0;
    for (const key of sequence) {
      const at = cache.indexOf(key);
      if (at >= 0) { hits++; cache.splice(at, 1); } else if (cache.length === capacity) cache.shift();
      cache.push(key);
    }
    return { parameters: { capacity, keys, length }, prompt: `LRU-кэш ёмкостью ${capacity} изначально пуст. Последовательность обращений: ${sequence.join(' ')}. Сколько будет попаданий?`, value: hits };
  }),
  family('live-pagination-pages', 'Подгрузка страниц ленты', 'systems', -1.8, ['mobile', 'frontend', 'backend'], seed => {
    const n = draw(seed), size = pick(n, [10, 20, 25, 30, 50]), item = n(1, 500);
    return { parameters: { size, item }, prompt: `Лента грузится страницами по ${size} элементов, начиная с первой. Пользователь долистал до ${item}-го элемента. Сколько страниц как минимум загружено?`, value: Math.ceil(item / size) };
  }, ['rest']),
  family('live-pairwise-min', 'Минимум тестов pairwise', 'quality', 1.1, ['qa'], seed => {
    const n = draw(seed), x = n(2, 6), y = n(2, 6), z = n(2, 6), sorted = [x, y, z].sort((a, b) => b - a);
    return { parameters: { x, y, z }, prompt: `Три независимых параметра: браузер (${x} значений), ОС (${y}), язык интерфейса (${z}). Какое минимальное число тестов даёт попарное (pairwise) покрытие всех пар значений?`, value: sorted[0] * sorted[1] };
  }, ['test_design']),
  family('live-equivalence-classes', 'Классы эквивалентности', 'quality', -1, ['qa'], seed => {
    const n = draw(seed), low = n(0, 18), high = low + n(40, 80), cuts = n(1, 5), gap = Math.floor((high - low) / (cuts + 1)), thresholds = Array.from({ length: cuts }, (_, i) => low + (i + 1) * gap);
    return { parameters: { low, high, cuts }, prompt: `Поле «возраст» принимает целые от ${low} до ${high}; тариф меняется начиная с возрастов ${thresholds.join(', ')}. Значения ниже и выше диапазона — разные ошибки. Сколько классов эквивалентности по числовому значению нужно покрыть (по одному тесту на класс)?`, value: cuts + 3 };
  }, ['test_design']),
  family('live-bva-two-point', 'Двухточечные граничные значения', 'quality', 0.1, ['qa'], seed => {
    const n = draw(seed), low = n(0, 18), high = low + n(40, 80), cuts = n(1, 5), gap = Math.floor((high - low) / (cuts + 1)), thresholds = Array.from({ length: cuts }, (_, i) => low + (i + 1) * gap);
    return { parameters: { low, high, cuts }, prompt: `Поле принимает целые от ${low} до ${high}; тариф меняется на значениях ${thresholds.join(', ')} (порог относится к новому тарифу). Двухточечный анализ граничных значений: для каждой границы между соседними классами, включая невалидные, берутся два значения по обе её стороны. Сколько различных тестовых значений получится?`, value: 2 * (cuts + 2) };
  }, ['test_design']),
  family('live-defect-density', 'Плотность дефектов', 'quality', -1.4, ['qa'], seed => {
    const n = draw(seed), defects = n(5, 200), loc = n(5, 200) * 500;
    return { parameters: { defects, loc }, prompt: `В модуле ${loc} строк кода найдено ${defects} дефектов. Какова плотность дефектов на 1000 строк (KLOC)? Округлите до двух знаков.`, value: defects / (loc / 1000), tolerance: R2 };
  }),
  family('live-dre', 'Эффективность устранения дефектов', 'quality', -0.2, ['qa'], seed => {
    const n = draw(seed), before = n(20, 300), after = n(1, 60);
    return { parameters: { before, after }, prompt: `До релиза команда нашла ${before} дефектов, после релиза пользователи нашли ещё ${after}. Какова эффективность устранения дефектов (DRE) в %? Округлите до двух знаков.`, value: before / (before + after) * 100, tolerance: R2 };
  }),
  family('live-mutation-score', 'Mutation score', 'quality', 0.9, ['qa'], seed => {
    const n = draw(seed), total = n(40, 200), equivalent = n(1, 10), killed = n(10, total - equivalent);
    return { parameters: { total, equivalent, killed }, prompt: `Мутационное тестирование: создано ${total} мутантов, ${equivalent} из них эквивалентны исходному коду (убить их невозможно), тесты убили ${killed}. Каков mutation score в % без учёта эквивалентных? Округлите до двух знаков.`, value: killed / (total - equivalent) * 100, tolerance: R2 };
  }, ['test_design']),
  family('live-decision-table', 'Правила таблицы решений', 'quality', -0.6, ['qa', 'analyst'], seed => {
    const n = draw(seed), binary = n(1, 5), ternary = n(0, 2);
    return { parameters: { binary, ternary }, prompt: `Полная таблица решений: ${binary} условий типа да/нет и ${ternary} условий с тремя возможными значениями. Сколько правил (столбцов) в ней без сокращения?`, value: 2 ** binary * 3 ** ternary };
  }, ['test_design']),
  family('live-one-switch', 'Покрытие 1-switch', 'quality', 1.5, ['qa'], seed => {
    const n = draw(seed), states = n(3, 5), names = 'ABCDE', edges: [number, number][] = [];
    for (let i = 0; i < states; i++) for (let j = 0; j < states; j++) if (i !== j && (j === (i + 1) % states || n(0, 9) < 3)) edges.push([i, j]);
    const value = Array.from({ length: states }, (_, s) => edges.filter(e => e[1] === s).length * edges.filter(e => e[0] === s).length).reduce((a, b) => a + b, 0);
    return { parameters: { states, transitions: edges.length }, prompt: `Диаграмма состояний, допустимые переходы: ${edges.map(([a, b]) => `${names[a]}→${names[b]}`).join(', ')}. Сколько тестовых условий нужно для 1-switch покрытия (все допустимые пары подряд идущих переходов)?`, value };
  }, ['test_design']),
  family('live-suite-duration', 'Длительность прогона тестов', 'quality', 0, ['qa'], seed => {
    const n = draw(seed), unit = n(200, 3000), unitMs = n(1, 20), integration = n(10, 200), integrationMs = n(1, 5) * 100, e2e = n(5, 60), e2eSec = n(10, 60), threads = n(2, 8);
    return { parameters: { unit, unitMs, integration, integrationMs, e2e, e2eSec, threads }, prompt: `Прогон идёт этапами: ${unit} unit-тестов по ${unitMs} мс последовательно, затем ${integration} интеграционных по ${integrationMs} мс последовательно, затем ${e2e} e2e по ${e2eSec} с в ${threads} параллельных потоков (тест целиком в одном потоке). Сколько мс займёт весь прогон?`, value: unit * unitMs + integration * integrationMs + Math.ceil(e2e / threads) * e2eSec * 1000 };
  }),
  family('live-flaky-rerun', 'Перезапуск нестабильного теста', 'quality', 1.6, ['qa', 'devops'], seed => {
    const n = draw(seed), fail = pick(n, [5, 10, 20, 25, 30, 40, 50]), reruns = n(1, 4);
    return { parameters: { fail, reruns }, prompt: `Тест независимо падает в ${fail}% запусков. CI перезапускает упавший тест до ${reruns} раз. С какой вероятностью (в %) сборка увидит этот тест зелёным? Округлите до двух знаков.`, value: 100 * (1 - (fail / 100) ** (reruns + 1)), tolerance: R2 };
  }, ['ci_cd']),
  family('live-line-coverage', 'Покрытие строк', 'quality', -1.7, ['qa'], seed => {
    const n = draw(seed), total = n(200, 5000), covered = n(50, total);
    return { parameters: { total, covered }, prompt: `Исполняемых строк ${total}, тесты выполнили ${covered}. Каково покрытие строк в %? Округлите до двух знаков.`, value: covered / total * 100, tolerance: R2 };
  }),
  family('live-cyclomatic', 'Цикломатическая сложность', 'quality', 0.8, ['qa', 'backend'], seed => {
    const n = draw(seed), ifs = n(0, 5), loops = n(0, 3), cases = n(2, 6), ands = n(0, 4);
    return { parameters: { ifs, loops, cases, ands }, prompt: `В функции: if — ${ifs} (без else if), циклов — ${loops}, switch с веток case — ${cases} (плюс default), операторов && в условиях — ${ands}. Цикломатическая сложность = число точек решения + 1, где каждый case и каждый && — отдельная точка. Чему она равна?`, value: ifs + loops + cases + ands + 1 };
  }, ['test_design']),
  family('live-littles-law-users', 'Виртуальные пользователи', 'quality', 0.8, ['qa', 'backend', 'devops'], seed => {
    const n = draw(seed), rps = n(1, 50) * 10, response = pick(n, [100, 200, 300, 500, 800, 1000, 1500, 2000]), think = n(0, 20);
    return { parameters: { rps, response, think }, prompt: `Нагрузочный тест: цель — ${rps} запросов/с, время ответа ${response} мс, think time ${think} с; каждый виртуальный пользователь шлёт запросы последовательно. Сколько виртуальных пользователей нужно по закону Литтла?`, value: rps * response / 1000 + rps * think };
  }, ['load_testing']),
  family('live-pert-estimate', 'Оценка по PERT', 'quality', -0.5, ['qa', 'analyst'], seed => {
    const n = draw(seed), optimistic = n(1, 10), likely = optimistic + n(1, 10), pessimistic = likely + n(1, 20);
    return { parameters: { optimistic, likely, pessimistic }, prompt: `Оценка задачи по PERT: оптимистично ${optimistic} ч, наиболее вероятно ${likely} ч, пессимистично ${pessimistic} ч. Каково ожидаемое время (O + 4M + P) / 6? Округлите до двух знаков.`, value: (optimistic + 4 * likely + pessimistic) / 6, tolerance: R2 };
  }),
  family('live-idempotency-charges', 'Ретраи и идемпотентность', 'systems', -0.7, ['backend', 'qa'], seed => {
    const n = draw(seed), lost = n(1, 5), keyed = n(0, 1), amount = n(1, 50) * 100;
    return { parameters: { lost, keyed, amount }, prompt: `Клиент отправляет POST /payments на ${amount} ₽ ${keyed ? 'с одним и тем же Idempotency-Key; сервер хранит ключи и не повторяет операцию' : 'без ключа идемпотентности'}. Сервер каждый раз проводит платёж, но ответ теряется ${lost} раз подряд; клиент повторяет запрос до успешного ответа. Сколько рублей спишут суммарно?`, value: amount * (keyed ? 1 : lost + 1) };
  }, ['rest']),
  family('live-btree-levels', 'Высота B-дерева индекса', 'databases', 1, ['backend'], seed => {
    const n = draw(seed), fanout = pick(n, [100, 200, 256, 500]), levels = n(2, 4), lower = fanout ** (levels - 1), keys = lower * n(1, fanout - 1) + n(1, lower);
    return { parameters: { fanout, levels, keys }, prompt: `Индекс устроен как B-дерево: каждая страница вмещает до ${fanout} записей (в листьях — ключи, во внутренних узлах — ссылки на дочерние страницы). Какое минимальное число уровней (страниц на пути от корня до листа) нужно для ${keys} ключей?`, value: levels };
  }, ['postgresql']),
  family('live-binary-search-probes', 'Проверки бинарного поиска', 'algorithms', 0.4, ['backend', 'frontend'], seed => {
    const n = draw(seed), size = n(10, 1000000);
    return { parameters: { size }, prompt: `Бинарный поиск по отсортированному массиву из ${size} элементов. Сколько элементов максимум придётся сравнить с искомым в худшем случае (включая неудачный поиск)?`, value: size.toString(2).length };
  }),
  family('live-db-pool-size', 'Размер пула соединений', 'databases', 0.5, ['backend', 'devops'], seed => {
    const n = draw(seed), rps = n(10, 200) * 10, hold = n(5, 200);
    return { parameters: { rps, hold }, prompt: `Сервис делает ${rps} запросов в БД в секунду, каждый держит соединение ${hold} мс. Сколько соединений минимум нужно в пуле, чтобы покрыть среднюю нагрузку по закону Литтла (округлите вверх)?`, value: Math.ceil(rps * hold / 1000) };
  }, ['postgresql']),
  family('live-rehash-moves', 'Перешардирование по модулю', 'databases', 1.7, ['backend', 'devops'], seed => {
    const n = draw(seed), shards = n(2, 9), keys = shards * (shards + 1) * n(1, 20) * 10;
    return { parameters: { shards, keys }, prompt: `Ключи — целые от 0 до ${keys - 1}, шард выбирается как key mod ${shards}. Добавили шард: теперь key mod ${shards + 1}. Сколько ключей сменят шард?`, value: keys * shards / (shards + 1) };
  }, ['system_design']),
  family('live-shard-count', 'Число шардов на горизонте', 'databases', -0.1, ['backend', 'devops'], seed => {
    const n = draw(seed), data = n(100, 2000), growth = n(10, 200), months = n(1, 24), capacity = pick(n, [500, 1000, 2000]), fill = pick(n, [60, 70, 75, 80]);
    return { parameters: { data, growth, months, capacity, fill }, prompt: `Сейчас ${data} ГБ данных, рост ${growth} ГБ в месяц. Шард вмещает ${capacity} ГБ, заполнять его можно не более чем на ${fill}%. Сколько шардов потребуется через ${months} мес.?`, value: Math.ceil((data + growth * months) * 100 / (capacity * fill)) };
  }, ['system_design']),
  family('live-fixed-window-limit', 'Лимит фиксированного окна', 'systems', 0, ['backend', 'qa'], seed => {
    const n = draw(seed), limit = n(10, 100), first = n(1, 150), second = n(1, 150);
    return { parameters: { limit, first, second }, prompt: `Rate limit: ${limit} запросов на фиксированное минутное окно (окна начинаются в :00 секунд). Клиент шлёт ${first} запросов в 12:00:59 и ${second} запросов в 12:01:00, раньше запросов не было. Сколько из них будет пропущено?`, value: Math.min(first, limit) + Math.min(second, limit) };
  }, ['rest']),
  family('live-n-plus-one', 'Проблема N+1', 'databases', 0.6, ['backend'], seed => {
    const n = draw(seed), orders = n(5, 200), batched = n(0, 1), batch = pick(n, [10, 25, 50, 100]);
    return { parameters: { orders, batched, batch }, prompt: `ORM загружает ${orders} заказов одним запросом, затем для каждого обращается к связям customer и items. ${batched ? `Включена пакетная подгрузка по ${batch} ключей: для каждой связи один IN-запрос на пачку.` : 'Подгрузка ленивая: отдельный запрос на каждый объект и каждую связь.'} Сколько SQL-запросов выполнится всего?`, value: 1 + 2 * (batched ? Math.ceil(orders / batch) : orders) };
  }, ['sql']),
  family('live-offset-scan', 'Стоимость OFFSET', 'databases', 0.2, ['backend'], seed => {
    const n = draw(seed), page = n(1, 500), size = pick(n, [10, 20, 50, 100]);
    return { parameters: { page, size }, prompt: `SELECT * FROM posts ORDER BY id LIMIT ${size} OFFSET ${(page - 1) * size}; по id есть индекс. Пропущенные OFFSET-строки тоже читаются и отбрасываются. Сколько строк индекса прочитает СУБД?`, value: page * size };
  }, ['postgresql']),
  family('live-quorum-read', 'Кворум чтения', 'databases', 0.9, ['backend', 'devops'], seed => {
    const n = draw(seed), replicas = n(3, 9), write = n(1, replicas);
    return { parameters: { replicas, write }, prompt: `Реплик ${replicas}, запись подтверждается ${write} репликами. Какое минимальное число реплик R нужно опрашивать при чтении, чтобы любое чтение гарантированно видело последнюю подтверждённую запись?`, value: replicas - write + 1 };
  }, ['system_design']),
  family('live-thread-pool-rps', 'Пропускная способность пула', 'systems', -0.6, ['backend', 'devops'], seed => {
    const n = draw(seed), threads = n(2, 64), busy = pick(n, [10, 20, 25, 40, 50, 100, 125, 200, 250, 500]);
    return { parameters: { threads, busy }, prompt: `Пул из ${threads} потоков, каждый запрос занимает поток на ${busy} мс (блокирующий ввод-вывод), очередь никогда не пустеет. Какова максимальная пропускная способность в запросах/с?`, value: threads * 1000 / busy };
  }),
  family('live-bloom-fpr', 'Ложные срабатывания Bloom-фильтра', 'algorithms', 1.8, ['backend', 'data_ml'], seed => {
    const n = draw(seed), items = n(1, 20) * 1000, perItem = pick(n, [4, 6, 8, 10, 12, 16]), hashes = n(1, 8), bits = items * perItem;
    return { parameters: { items, bits, hashes }, prompt: `Bloom-фильтр: m = ${bits} бит, k = ${hashes} хеш-функций, вставлено n = ${items} элементов. Оцените по стандартной формуле вероятность ложноположительного ответа в процентах. Округлите до трёх знаков.`, value: 100 * (1 - Math.exp(-hashes * items / bits)) ** hashes, tolerance: R3 };
  }),
  family('live-jwt-remaining', 'Срок жизни JWT', 'systems', -1, ['backend', 'frontend', 'mobile'], seed => {
    const n = draw(seed), ttl = pick(n, [5, 10, 15, 30, 60]), elapsed = n(0, ttl * 60 - 1), leeway = pick(n, [0, 30, 60]);
    return { parameters: { ttl, elapsed, leeway }, prompt: `Access-токен живёт ${ttl} мин (exp = iat + ${ttl * 60} с). Сервер принимает токены с допуском расхождения часов ${leeway} с. С момента выдачи прошло ${elapsed} с. Сколько ещё секунд токен будет приниматься?`, value: ttl * 60 + leeway - elapsed };
  }, ['rest']),
  family('live-complexity-scaling', 'Рост времени по big-O', 'algorithms', -0.4, ['backend', 'data_ml', 'frontend', 'mobile'], seed => {
    const n = draw(seed), power = n(1, 3), base = n(1, 50) * 100, time = n(1, 50), factor = pick(n, [2, 3, 4, 5, 10]);
    return { parameters: { power, base, time, factor }, prompt: `Алгоритм ${power === 1 ? 'O(n)' : `O(n^${power})`} обрабатывает ${base} элементов за ${time} мс. Сколько мс займёт ${base * factor} элементов, если время точно пропорционально оценке?`, value: time * factor ** power };
  }),
  family('live-hashmap-resizes', 'Расширения хеш-таблицы', 'algorithms', 1.1, ['backend'], seed => {
    const n = draw(seed), initial = pick(n, [16, 32, 64]), inserts = n(10, 2000);
    let capacity = initial, resizes = 0;
    while (inserts > capacity * 0.75) { capacity *= 2; resizes++; }
    return { parameters: { initial, inserts }, prompt: `Хеш-таблица: начальная ёмкость ${initial}, коэффициент загрузки 0.75; ёмкость удваивается, как только число элементов превышает ёмкость × 0.75. Сколько раз произойдёт расширение при вставке ${inserts} уникальных ключей?`, value: resizes };
  }),
  family('live-kafka-consumers', 'Партиции и консьюмеры', 'systems', 0.7, ['backend', 'devops'], seed => {
    const n = draw(seed), partitions = n(1, 24), consumers = n(1, 24), idle = n(0, 1);
    return { parameters: { partitions, consumers, idle }, prompt: `Топик Kafka из ${partitions} партиций читает consumer group из ${consumers} консьюмеров. ${idle ? 'Сколько консьюмеров будут простаивать?' : 'Сколько партиций максимум достанется одному консьюмеру при равномерном распределении?'}`, value: idle ? Math.max(0, consumers - partitions) : Math.ceil(partitions / consumers) };
  }, ['kafka']),
  family('live-log-volume', 'Объём логов', 'systems', -0.9, ['backend', 'devops'], seed => {
    const n = draw(seed), rate = n(1, 50) * 100, size = pick(n, [200, 300, 500, 800, 1000]), days = pick(n, [7, 14, 30]);
    return { parameters: { rate, size, days }, prompt: `Сервис пишет ${rate} строк лога в секунду по ${size} байт. Сколько ГБ (10^9 байт) займут логи за ${days} суток хранения без сжатия? Округлите до двух знаков.`, value: rate * size * 86400 * days / 1e9, tolerance: R2 };
  }, ['observability_be']),
  family('live-sql-group-by-rows', 'Строки GROUP BY', 'databases', -0.8, ['backend', 'qa', 'data_ml', 'analyst'], seed => {
    const n = draw(seed), cities = n(2, 10), statuses = n(2, 5), missing = n(0, cities * statuses - 1), nullStatuses = n(0, statuses);
    return { parameters: { cities, statuses, missing, nullStatuses }, prompt: `SELECT city, status, COUNT(*) FROM orders GROUP BY city, status. В таблице ${cities} городов и ${statuses} статусов; из ${cities * statuses} возможных пар (city, status) встречаются все, кроме ${missing}. Ещё есть заказы с city = NULL, у них ${nullStatuses} различных статусов. Сколько строк вернёт запрос?`, value: cities * statuses - missing + nullStatuses };
  }, ['sql']),
  family('live-sql-left-join', 'Строки LEFT JOIN', 'databases', 0.1, ['backend', 'qa', 'data_ml', 'analyst'], seed => {
    const n = draw(seed), users = n(5, 100), buyers = n(0, users), each = n(1, 5);
    return { parameters: { users, buyers, each }, prompt: `users LEFT JOIN orders ON orders.user_id = users.id. В users ${users} строк; у ${buyers} пользователей ровно по ${each} заказ(а), у остальных заказов нет. Сколько строк в результате?`, value: buyers * each + users - buyers };
  }, ['sql']),
  family('live-cidr-split', 'Деление сети на подсети', 'systems', 0.4, ['devops'], seed => {
    const n = draw(seed), prefix = n(8, 24), subnet = prefix + n(1, 6);
    return { parameters: { prefix, subnet }, prompt: `Блок адресов /${prefix} делят на подсети /${subnet}. Сколько подсетей получится?`, value: 2 ** (subnet - prefix) };
  }),
  family('live-k8s-max-replicas', 'Вместимость кластера k8s', 'systems', 0.5, ['devops'], seed => {
    const n = draw(seed), nodes = n(2, 10), cpu = pick(n, [1900, 3800, 7600, 15600]), mem = pick(n, [6, 14, 30, 60]), podCpu = n(1, 20) * 50, podMem = n(1, 16) * 128;
    return { parameters: { nodes, cpu, mem, podCpu, podMem }, prompt: `Нод в кластере: ${nodes}, все одинаковые; у каждой allocatable ${cpu}m CPU и ${mem} GiB памяти, больше ничего не запущено. Под запрашивает ${podCpu}m CPU и ${podMem} MiB. Лимит — 110 подов на ноду. Сколько реплик максимум поместится?`, value: nodes * Math.min(110, Math.floor(cpu / podCpu), Math.floor(mem * 1024 / podMem)) };
  }, ['kubernetes']),
  family('live-hpa-desired', 'Расчёт HPA', 'systems', 0.8, ['devops'], seed => {
    const n = draw(seed), current = n(2, 20), target = pick(n, [50, 60, 70, 80]), drawn = n(10, 100), utilization = Math.abs(drawn / target - 1) <= 0.1 ? target + target / 2 : drawn, max = n(5, 30);
    return { parameters: { current, target, utilization, max }, prompt: `HPA: текущих реплик — ${current}, средняя загрузка CPU ${utilization}% при цели ${target}%. minReplicas 2, maxReplicas ${max}. Сколько реплик выставит HPA (окно стабилизации не учитывать)?`, value: Math.min(max, Math.max(2, Math.ceil(current * utilization / target))) };
  }, ['kubernetes']),
  family('live-rolling-update', 'RollingUpdate в процентах', 'systems', 1.2, ['devops'], seed => {
    const n = draw(seed), replicas = n(2, 20), surge = pick(n, [10, 20, 25, 30, 50]), unavailable = pick(n, [0, 10, 20, 25, 30, 50]), peak = n(0, 1);
    return { parameters: { replicas, surge, unavailable, peak }, prompt: `Deployment с replicas: ${replicas}, strategy RollingUpdate с maxSurge ${surge}% и maxUnavailable ${unavailable}%. ${peak ? 'Сколько подов максимум может существовать одновременно во время обновления?' : 'Какое минимальное число доступных подов гарантируется во время обновления?'}`, value: peak ? replicas + Math.ceil(replicas * surge / 100) : replicas - Math.floor(replicas * unavailable / 100) };
  }, ['kubernetes']),
  family('live-raid-capacity', 'Ёмкость RAID', 'systems', -0.2, ['devops'], seed => {
    const n = draw(seed), level = pick(n, [0, 1, 5, 6, 10]), size = pick(n, [1, 2, 4, 8, 12, 16]);
    const disks = level === 1 ? 2 : level === 5 ? n(3, 8) : level === 6 ? n(4, 8) : level === 10 ? n(2, 4) * 2 : n(2, 8);
    const usable = level === 0 ? disks : level === 1 ? 1 : level === 5 ? disks - 1 : level === 6 ? disks - 2 : disks / 2;
    return { parameters: { level, disks, size }, prompt: `RAID ${level} из ${disks} дисков по ${size} ТБ. Какая полезная ёмкость массива в ТБ?`, value: usable * size };
  }, ['linux']),
  family('live-availability-chain', 'Доступность цепочки', 'systems', 1, ['devops', 'backend'], seed => {
    const n = draw(seed), levels = [99, 99.5, 99.9, 99.95, 99.99], first = pick(n, levels), second = pick(n, levels), parallel = n(0, 1);
    return { parameters: { first, second, parallel }, prompt: parallel ? `Два независимых экземпляра за идеальным балансировщиком, каждый доступен ${first}% времени; запрос успешен, если жив хотя бы один. Какова доступность в %? Округлите до трёх знаков.` : `Запрос проходит последовательно через сервис A (доступность ${first}%) и сервис B (${second}%), отказы независимы. Какова итоговая доступность в %? Округлите до трёх знаков.`, value: parallel ? 100 * (1 - (1 - first / 100) ** 2) : first * second / 100, tolerance: R3 };
  }, ['system_design']),
  family('live-burn-rate', 'Burn rate бюджета ошибок', 'systems', 1.5, ['devops'], seed => {
    const n = draw(seed), slo = pick(n, [99, 99.5, 99.9]), rate = n(1, 20), hours = n(1, 48);
    return { parameters: { slo, rate, hours }, prompt: `SLO ${slo}% на окно 30 суток. ${hours} ч подряд burn rate держался на уровне ${rate}. Какую долю (в %) бюджета ошибок окна это израсходовало? Округлите до двух знаков.`, value: rate * hours / 720 * 100, tolerance: R2 };
  }, ['observability_be']),
  family('live-jvm-heap', 'Heap JVM в контейнере', 'systems', -0.4, ['devops', 'backend'], seed => {
    const n = draw(seed), limit = pick(n, [512, 1024, 1536, 2048, 3072, 4096]), percent = pick(n, [25, 50, 75]);
    return { parameters: { limit, percent }, prompt: `Контейнер с memory limit ${limit} MiB, JVM запущена с -XX:MaxRAMPercentage=${percent}. Каким будет максимальный heap в MiB?`, value: limit * percent / 100 };
  }, ['docker']),
  family('live-disk-full-days', 'Заполнение диска', 'systems', -0.9, ['devops'], seed => {
    const n = draw(seed), size = pick(n, [100, 250, 500, 1000, 2000]), used = n(30, 85), growth = n(1, 50);
    return { parameters: { size, used, growth }, prompt: `Диск ${size} ГБ заполнен на ${used}%, данные растут на ${growth} ГБ в сутки. Через сколько суток он заполнится полностью? Округлите до двух знаков.`, value: size * (100 - used) / 100 / growth, tolerance: R2 };
  }, ['linux']),
  family('live-backup-storage', 'Хранилище бэкапов', 'systems', -0.6, ['devops'], seed => {
    const n = draw(seed), full = n(50, 500), incremental = n(5, 60), weeks = n(1, 8);
    return { parameters: { full, incremental, weeks }, prompt: `Каждое воскресенье делается полный бэкап ${full} ГБ, в остальные 6 дней — инкрементальные по ${incremental} ГБ. Храним ${weeks} полных недельных цепочек. Сколько ГБ занимает хранилище?`, value: weeks * (full + 6 * incremental) };
  }),
  family('live-canary-errors', 'Ошибки canary', 'systems', 0, ['devops', 'qa'], seed => {
    const n = draw(seed), rps = n(1, 20) * 100, weight = pick(n, [1, 2, 5, 10, 20, 25, 50]), errors = pick(n, [1, 2, 5, 10]);
    return { parameters: { rps, weight, errors }, prompt: `Сервис получает ${rps} запросов/с. На canary идёт ${weight}% трафика, у canary ${errors}% ответов — ошибки. Сколько ошибочных ответов canary отдаст за час?`, value: rps * 3600 * weight * errors / 10000 };
  }, ['ci_cd']),
  family('live-docker-layer-cache', 'Кэш слоёв Docker', 'systems', -1.3, ['devops', 'backend'], seed => {
    const n = draw(seed), steps = n(5, 12), changed = n(2, steps);
    return { parameters: { steps, changed }, prompt: `Dockerfile из ${steps} инструкций, каждая создаёт слой. Изменился только файл, который копируется на шаге ${changed}; более ранние шаги от него не зависят. Сколько шагов выполнится заново при сборке с кэшем?`, value: steps - changed + 1 };
  }, ['docker']),
  family('live-pdb-disruptions', 'PodDisruptionBudget', 'systems', 1.3, ['devops'], seed => {
    const n = draw(seed), replicas = n(2, 20), percent = pick(n, [20, 25, 30, 40, 50, 60, 75, 80, 90]);
    return { parameters: { replicas, percent }, prompt: `PodDisruptionBudget с minAvailable: ${percent}% для Deployment с replicas: ${replicas} (все поды здоровы). Сколько подов можно вытеснить одновременно при drain?`, value: replicas - Math.ceil(replicas * percent / 100) };
  }, ['kubernetes']),
  family('live-prometheus-samples', 'Сэмплы Prometheus', 'systems', 0.7, ['devops'], seed => {
    const n = draw(seed), metrics = n(1, 10), methods = n(2, 10), statuses = n(2, 8), instances = n(1, 20), interval = pick(n, [10, 15, 30, 60]);
    return { parameters: { metrics, methods, statuses, instances, interval }, prompt: `Сервис экспортирует ${metrics} метрик, у каждой лейблы method (${methods} значений) и status (${statuses} значений), все комбинации встречаются. Prometheus опрашивает ${instances} инстансов каждые ${interval} с. Сколько сэмплов в сутки он сохранит?`, value: metrics * methods * statuses * instances * 86400 / interval };
  }, ['prometheus']),
  family('live-mttr', 'MTTR', 'systems', -1.5, ['devops', 'qa'], seed => {
    const n = draw(seed), incidents = n(2, 20), total = incidents * n(5, 120) + n(0, incidents - 1);
    return { parameters: { incidents, total }, prompt: `За квартал было ${incidents} инцидентов с суммарным временем восстановления ${total} минут. Чему равен MTTR в минутах? Округлите до двух знаков.`, value: total / incidents, tolerance: R2 };
  }),
  family('live-ci-cache-hours', 'Экономия от кэша CI', 'systems', -1.8, ['devops'], seed => {
    const n = draw(seed), saved = n(1, 15), runs = n(5, 100) * 2;
    return { parameters: { saved, runs }, prompt: `Кэш зависимостей экономит ${saved} мин на каждом запуске CI, запусков ${runs} в сутки. Сколько часов сэкономится за 30 суток?`, value: saved * runs * 30 / 60 };
  }, ['ci_cd']),
  family('live-backup-transfer', 'Время копирования бэкапа', 'systems', -0.7, ['devops'], seed => {
    const n = draw(seed), size = n(10, 2000), bandwidth = pick(n, [100, 200, 400, 500, 1000, 10000]);
    return { parameters: { size, bandwidth }, prompt: `Бэкап ${size} ГБ (10^9 байт) копируется по каналу ${bandwidth} Мбит/с (10^6 бит/с) на полной скорости. Сколько минут займёт копирование? Округлите до двух знаков.`, value: size * 8000 / bandwidth / 60, tolerance: R2 };
  }),
  family('live-ephemeral-ports', 'Эфемерные порты и TIME_WAIT', 'systems', 1.6, ['devops', 'backend'], seed => {
    const n = draw(seed), low = pick(n, [1024, 10000, 32768, 49152]), high = pick(n, [60999, 65535]), wait = pick(n, [30, 60, 120]);
    return { parameters: { low, high, wait }, prompt: `ip_local_port_range = ${low} ${high}, сокет держится в TIME_WAIT ${wait} с, повторного использования нет. Все соединения идут с одного IP клиента на один IP:порт и закрываются клиентом. Сколько новых соединений в секунду можно открывать стабильно (округлите вниз)?`, value: Math.floor((high - low + 1) / wait) };
  }, ['linux']),
  family('live-chmod-octal', 'Права chmod', 'systems', -1, ['devops', 'backend'], seed => {
    const n = draw(seed), owner = n(1, 7), group = n(0, 7), other = n(0, 7), text = (d: number) => `${d & 4 ? 'r' : '-'}${d & 2 ? 'w' : '-'}${d & 1 ? 'x' : '-'}`;
    return { parameters: { owner, group, other }, prompt: `ls -l показывает права файла -${text(owner)}${text(group)}${text(other)}. Какой восьмеричный режим из трёх цифр (например, 640) передать chmod, чтобы их установить?`, value: owner * 100 + group * 10 + other };
  }, ['linux']),
  family('live-umask', 'Права с учётом umask', 'systems', 0.1, ['devops'], seed => {
    const n = draw(seed), mask = [pick(n, [0, 2]), n(0, 7), n(0, 7)], directory = n(0, 1), base = directory ? 7 : 6, digits = mask.map(m => base & ~m);
    return { parameters: { directory, mask: mask[0] * 100 + mask[1] * 10 + mask[2] }, prompt: `umask 0${mask.join('')}. С какими правами (три восьмеричные цифры) будет создан новый ${directory ? 'каталог (базовые 777)' : 'файл (базовые 666)'}?`, value: digits[0] * 100 + digits[1] * 10 + digits[2] };
  }, ['linux']),
  family('live-weighted-round-robin', 'Weighted round-robin', 'systems', -0.8, ['devops', 'backend'], seed => {
    const n = draw(seed), w1 = n(1, 5), w2 = n(1, 5), w3 = n(1, 5), total = (w1 + w2 + w3) * n(10, 100);
    return { parameters: { w1, w2, w3, total }, prompt: `Nginx upstream из трёх серверов с weight=${w1}, ${w2} и ${w3}, все здоровы. Сколько из ${total} запросов получит второй сервер при weighted round-robin?`, value: total * w2 / (w1 + w2 + w3) };
  }, ['nginx']),
  family('live-precision-recall', 'Precision и recall', 'data_reasoning', -1, ['data_ml', 'qa', 'analyst'], seed => {
    const n = draw(seed), tp = n(10, 200), fp = n(1, 80), fn = n(1, 80), recall = n(0, 1);
    return { parameters: { tp, fp, fn, recall }, prompt: `Классификатор: TP=${tp}, FP=${fp}, FN=${fn}. Чему равен ${recall ? 'recall' : 'precision'} в %? Округлите до двух знаков.`, value: 100 * tp / (tp + (recall ? fn : fp)), tolerance: R2 };
  }, ['ml']),
  family('live-accuracy-baseline', 'Accuracy на несбалансированных данных', 'data_reasoning', -0.3, ['data_ml', 'analyst', 'qa'], seed => {
    const n = draw(seed), total = n(1, 50) * 100, positive = n(1, 30);
    return { parameters: { total, positive }, prompt: `В выборке ${total} объектов, из них ${positive}% — положительный класс. Модель всегда предсказывает «отрицательный». Какова её accuracy в %?`, value: 100 - positive };
  }, ['ml']),
  family('live-kfold-train-size', 'Размер train в k-fold', 'data_reasoning', -1.5, ['data_ml'], seed => {
    const n = draw(seed), folds = pick(n, [3, 4, 5, 8, 10]), total = folds * n(20, 500);
    return { parameters: { folds, total }, prompt: `${folds}-fold кросс-валидация на ${total} объектах, фолды равного размера. Сколько объектов в обучающей части на каждой итерации?`, value: total - total / folds };
  }, ['sklearn']),
  family('live-steps-per-epoch', 'Шаги оптимизатора', 'data_reasoning', -0.6, ['data_ml'], seed => {
    const n = draw(seed), total = n(1000, 60000), batch = pick(n, [16, 32, 64, 128, 256]), epochs = n(1, 20), dropLast = n(0, 1);
    return { parameters: { total, batch, epochs, dropLast }, prompt: `Датасет ${total} примеров, DataLoader(batch_size=${batch}, drop_last=${dropLast ? 'True' : 'False'}), ${epochs} эпох, шаг оптимизатора на каждый батч. Сколько шагов будет сделано?`, value: epochs * (dropLast ? Math.floor(total / batch) : Math.ceil(total / batch)) };
  }, ['pytorch']),
  family('live-mlp-params', 'Параметры MLP', 'algorithms', 0.3, ['data_ml'], seed => {
    const n = draw(seed), input = n(4, 784), first = n(8, 512), second = n(8, 256), output = n(1, 10);
    return { parameters: { input, first, second, output }, prompt: `Полносвязная сеть ${input} → ${first} → ${second} → ${output}, у всех слоёв есть bias. Сколько обучаемых параметров?`, value: input * first + first + first * second + second + second * output + output };
  }, ['pytorch']),
  family('live-conv-params', 'Параметры свёртки', 'algorithms', 0.7, ['data_ml'], seed => {
    const n = draw(seed), kernel = pick(n, [1, 3, 5, 7]), input = pick(n, [1, 3, 16, 32, 64, 128]), output = pick(n, [8, 16, 32, 64, 128, 256]), bias = n(0, 1);
    return { parameters: { kernel, input, output, bias }, prompt: `Conv2d(in_channels=${input}, out_channels=${output}, kernel_size=${kernel}, bias=${bias ? 'True' : 'False'}). Сколько обучаемых параметров?`, value: (kernel * kernel * input + bias) * output };
  }, ['pytorch']),
  family('live-conv-output', 'Размер выхода свёртки', 'algorithms', 0.9, ['data_ml'], seed => {
    const n = draw(seed), size = n(16, 256), kernel = pick(n, [1, 3, 5, 7]), stride = pick(n, [1, 2, 3]), padding = n(0, 3);
    return { parameters: { size, kernel, stride, padding }, prompt: `Свёртка по входу ${size}×${size}: kernel ${kernel}, stride ${stride}, padding ${padding}, dilation 1. Какой будет ширина выхода (как в PyTorch, с округлением вниз)?`, value: Math.floor((size + 2 * padding - kernel) / stride) + 1 };
  }, ['pytorch']),
  family('live-embedding-memory', 'Память таблицы эмбеддингов', 'data_reasoning', 0.2, ['data_ml'], seed => {
    const n = draw(seed), vocab = pick(n, [10000, 30000, 50000, 100000, 250000]), dim = pick(n, [64, 128, 256, 512, 768, 1024]), half = n(0, 1);
    return { parameters: { vocab, dim, half }, prompt: `Таблица эмбеддингов: словарь ${vocab} токенов, размерность ${dim}, тип ${half ? 'float16' : 'float32'}. Сколько МиБ (1 МиБ = 1048576 байт) она займёт? Округлите до двух знаков.`, value: vocab * dim * (half ? 2 : 4) / 1048576, tolerance: R2 };
  }, ['ml']),
  family('live-auc-pairs', 'ROC AUC по парам', 'data_reasoning', 1.5, ['data_ml', 'analyst'], seed => {
    const n = draw(seed), positives = n(2, 4), negatives = n(2, 4), scores: number[] = [];
    while (scores.length < positives + negatives) { const s = n(10, 99); if (!scores.includes(s)) scores.push(s); }
    const pos = scores.slice(0, positives), neg = scores.slice(positives), wins = pos.reduce((a, p) => a + neg.filter(q => p > q).length, 0);
    return { parameters: { positives, negatives, wins }, prompt: `Скоры модели (в сотых): положительные объекты — ${pos.join(', ')}; отрицательные — ${neg.join(', ')}. Чему равен ROC AUC в %? Округлите до двух знаков.`, value: 100 * wins / (positives * negatives), tolerance: R2 };
  }, ['ml']),
  family('live-ppv-bayes', 'Precision при редком классе', 'data_reasoning', 1.7, ['data_ml', 'analyst'], seed => {
    const n = draw(seed), prevalence = pick(n, [1, 2, 5, 10, 20]), sensitivity = pick(n, [80, 90, 95, 99]), specificity = pick(n, [80, 90, 95, 99]);
    return { parameters: { prevalence, sensitivity, specificity }, prompt: `Доля положительного класса ${prevalence}%. У модели recall ${sensitivity}% и специфичность ${specificity}%. Какой будет precision в %? Округлите до двух знаков.`, value: 100 * sensitivity * prevalence / (sensitivity * prevalence + (100 - specificity) * (100 - prevalence)), tolerance: R2 };
  }, ['ml']),
  family('live-grad-accumulation', 'Накопление градиентов', 'data_reasoning', 0.6, ['data_ml'], seed => {
    const n = draw(seed), gpus = pick(n, [1, 2, 4, 8]), batch = pick(n, [4, 8, 16, 32]), accumulation = pick(n, [1, 2, 4, 8]), total = gpus * batch * accumulation * n(50, 2000);
    return { parameters: { gpus, batch, accumulation, total }, prompt: `Обучение на ${gpus} GPU, per-device batch ${batch}, gradient_accumulation_steps=${accumulation}. Датасет ${total} примеров. Сколько шагов оптимизатора за эпоху?`, value: total / (gpus * batch * accumulation) };
  }, ['pytorch']),
  family('live-step-lr', 'StepLR', 'data_reasoning', 0.5, ['data_ml'], seed => {
    const n = draw(seed), lr = pick(n, [0.1, 0.05, 0.01, 0.001]), gamma = pick(n, [0.1, 0.5]), step = pick(n, [5, 10, 20, 30]), epoch = n(0, 4 * step - 1);
    return { parameters: { lr, gamma, step, epoch }, prompt: `StepLR: начальный lr = ${lr}, step_size = ${step}, gamma = ${gamma}; scheduler.step() вызывается в конце каждой эпохи. Каким будет lr во время эпохи с индексом ${epoch} (нумерация с 0)? Ответ — десятичная дробь.`, value: lr * gamma ** Math.floor(epoch / step), tolerance: 1e-12 };
  }, ['pytorch']),
  family('live-stratified-split', 'Стратифицированный split', 'data_reasoning', -0.7, ['data_ml'], seed => {
    const n = draw(seed), total = n(1, 40) * 500, positive = pick(n, [2, 4, 6, 10, 20, 30]);
    return { parameters: { total, positive }, prompt: `Датасет ${total} объектов, ${positive}% — положительный класс. train_test_split(test_size=0.2, stratify=y). Сколько положительных объектов попадёт в тест?`, value: total * positive / 500 };
  }, ['sklearn']),
  family('live-model-memory', 'Память модели', 'systems', 1.1, ['data_ml'], seed => {
    const n = draw(seed), params = pick(n, [125, 350, 1300, 3000, 7000, 13000]), mode = n(0, 2), bytes = [2, 1, 16][mode];
    return { parameters: { params, mode }, prompt: `Модель на ${params} млн параметров. ${['Сколько ГБ занимают веса в fp16', 'Сколько ГБ занимают веса после квантования в int8', 'Обучение с Adam в mixed precision: веса и градиенты в fp16, мастер-копия весов и два момента Adam в fp32. Сколько ГБ занимают эти данные'][mode]} (1 ГБ = 10^9 байт, активации не учитывать)? Округлите до двух знаков.`, value: params * bytes / 1000, tolerance: R2 };
  }, ['llm']),
  family('live-tfidf', 'TF-IDF', 'data_reasoning', 0.8, ['data_ml'], seed => {
    const n = draw(seed), power = n(1, 3), df = n(1, 9), docs = df * 10 ** power, count = n(1, 10), length = n(20, 200);
    return { parameters: { power, df, docs, count, length }, prompt: `TF-IDF: tf = вхождения термина / слов в документе, idf = log10(N / df). Термин встречается ${count} раз в документе из ${length} слов; корпус — ${docs} документов, термин есть в ${df} из них. Чему равен tf-idf? Округлите до трёх знаков.`, value: count / length * power, tolerance: R3 };
  }, ['ml']),
  family('live-knn-regression', 'kNN-регрессия', 'algorithms', 0.4, ['data_ml'], seed => {
    const n = draw(seed), k = pick(n, [3, 5]), query = n(5, 55) + 0.25, xs: number[] = [];
    while (xs.length < 8) { const x = n(0, 60); if (!xs.includes(x)) xs.push(x); }
    const points = xs.map(x => ({ x, y: n(1, 100) })), nearest = [...points].sort((a, b) => Math.abs(a.x - query) - Math.abs(b.x - query)).slice(0, k);
    return { parameters: { k, query }, prompt: `kNN-регрессия, k=${k}, расстояние |x − x'|. Обучающие точки (x; y): ${points.map(p => `(${p.x}; ${p.y})`).join(', ')}. Каков прогноз (среднее y соседей) для x = ${query}? Округлите до двух знаков.`, value: nearest.reduce((a, p) => a + p.y, 0) / k, tolerance: R2 };
  }, ['ml']),
  family('live-onehot-columns', 'Столбцы после one-hot', 'data_reasoning', -0.9, ['data_ml', 'analyst'], seed => {
    const n = draw(seed), numeric = n(1, 10), c1 = n(2, 12), c2 = n(2, 12), c3 = n(2, 12), dropFirst = n(0, 1);
    return { parameters: { numeric, c1, c2, c3, dropFirst }, prompt: `Признаки: ${numeric} числовых и три категориальных с ${c1}, ${c2} и ${c3} уникальными значениями (пропусков нет). pd.get_dummies(df, columns=[три категориальных], drop_first=${dropFirst ? 'True' : 'False'}). Сколько столбцов получится?`, value: numeric + c1 + c2 + c3 - (dropFirst ? 3 : 0) };
  }, ['pandas']),
  family('live-zscore', 'Z-оценка', 'data_reasoning', -1.6, ['data_ml', 'analyst'], seed => {
    const n = draw(seed), mean = n(10, 100), std = pick(n, [2, 4, 5, 8, 10, 20]), x = n(0, 200);
    return { parameters: { mean, std, x }, prompt: `Признак имеет среднее ${mean} и стандартное отклонение ${std}. Чему равен z-score значения ${x}? Округлите до двух знаков.`, value: (x - mean) / std, tolerance: R2 };
  }),
  family('live-mse', 'Среднеквадратичная ошибка', 'data_reasoning', -0.5, ['data_ml', 'analyst'], seed => {
    const n = draw(seed), actual = Array.from({ length: 4 }, () => n(0, 20)), predicted = actual.map(a => a + n(-5, 5));
    return { parameters: { error: actual.reduce((s, a, i) => s + (a - predicted[i]) ** 2, 0) }, prompt: `Истинные значения: ${actual.join(', ')}; прогнозы: ${predicted.join(', ')}. Чему равен MSE? Округлите до двух знаков.`, value: actual.reduce((s, a, i) => s + (a - predicted[i]) ** 2, 0) / 4, tolerance: R2 };
  }, ['ml']),
  family('live-attention-params', 'Параметры self-attention', 'algorithms', 1.4, ['data_ml'], seed => {
    const n = draw(seed), dim = pick(n, [64, 128, 256, 512, 768, 1024]), heads = pick(n, [1, 2, 4, 8]), bias = n(0, 1);
    return { parameters: { dim, heads, bias }, prompt: `Multi-head self-attention: d_model=${dim}, ${heads} голов(ы), проекции Q, K, V и выходная — линейные слои d_model×d_model ${bias ? 'со смещением' : 'без смещения'}. Сколько параметров в блоке?`, value: 4 * dim * dim + (bias ? 4 * dim : 0) };
  }, ['llm']),
  family('live-log-loss', 'Log loss на примере', 'data_reasoning', 1, ['data_ml'], seed => {
    const n = draw(seed), p = n(1, 99), label = n(0, 1);
    return { parameters: { p, label }, prompt: `Модель выдала вероятность положительного класса ${p / 100}, истинная метка y = ${label}. Чему равен log loss (натуральный логарифм) на этом примере? Округлите до трёх знаков.`, value: -Math.log(label ? p / 100 : 1 - p / 100), tolerance: R3 };
  }, ['ml']),
  family('live-recall-at-k', 'Recall@K', 'data_reasoning', 0.3, ['data_ml', 'analyst'], seed => {
    const n = draw(seed), relevant = n(2, 6), k = pick(n, [3, 5, 10]), positions: number[] = [];
    while (positions.length < relevant) { const p = n(1, 20); if (!positions.includes(p)) positions.push(p); }
    positions.sort((a, b) => a - b);
    return { parameters: { relevant, k }, prompt: `В выдаче из 20 документов релевантные стоят на позициях ${positions.join(', ')}; других релевантных нет. Чему равен Recall@${k} в %? Округлите до двух знаков.`, value: 100 * positions.filter(p => p <= k).length / relevant, tolerance: R2 };
  }, ['ml']),
  family('live-funnel-conversion', 'Сквозная конверсия', 'data_reasoning', -1.3, ['analyst'], seed => {
    const n = draw(seed), visits = n(1000, 50000), carts = Math.floor(visits * n(10, 40) / 100), orders = Math.floor(carts * n(10, 60) / 100);
    return { parameters: { visits, carts, orders }, prompt: `Воронка: ${visits} посетителей → ${carts} добавили товар в корзину → ${orders} оформили заказ. Какова сквозная конверсия из посетителя в заказ в %? Округлите до двух знаков.`, value: 100 * orders / visits, tolerance: R2 };
  }, ['bi']),
  family('live-funnel-traffic', 'Трафик под план заказов', 'data_reasoning', 0.4, ['analyst'], seed => {
    const n = draw(seed), target = n(50, 1000), toCart = n(5, 40), toOrder = n(10, 60);
    return { parameters: { target, toCart, toOrder }, prompt: `Конверсия из визита в корзину ${toCart}%, из корзины в заказ ${toOrder}%. Сколько визитов минимум нужно, чтобы ожидать не меньше ${target} заказов?`, value: Math.ceil(target * 10000 / (toCart * toOrder)) };
  }),
  family('live-retention-day', 'Retention N-го дня', 'data_reasoning', -0.9, ['analyst'], seed => {
    const n = draw(seed), cohort = n(500, 10000), day = pick(n, [1, 7, 30]), active = n(Math.ceil(cohort * 0.05), Math.floor(cohort * 0.6));
    return { parameters: { cohort, day, active }, prompt: `Когорта — ${cohort} новых пользователей. На ${day}-й день после установки приложение открыли ${active} из них. Каков retention ${day}-го дня в %? Округлите до двух знаков.`, value: 100 * active / cohort, tolerance: R2 };
  }, ['bi']),
  family('live-ab-lift', 'Относительный прирост в A/B', 'data_reasoning', -0.2, ['analyst'], seed => {
    const n = draw(seed), sizeA = n(1000, 20000), sizeB = n(1000, 20000), convA = n(Math.ceil(sizeA * 0.02), Math.floor(sizeA * 0.2)), convB = n(Math.ceil(sizeB * 0.02), Math.floor(sizeB * 0.2));
    return { parameters: { sizeA, convA, sizeB, convB }, prompt: `A/B-тест: в группе A ${sizeA} пользователей и ${convA} конверсий, в B — ${sizeB} и ${convB}. На сколько процентов (относительно) конверсия B выше конверсии A? Отрицательное значение — ниже. Округлите до двух знаков.`, value: 100 * ((convB / sizeB) / (convA / sizeA) - 1), tolerance: R2 };
  }),
  family('live-ab-sample-size', 'Размер выборки A/B', 'data_reasoning', 0.9, ['analyst', 'data_ml'], seed => {
    const n = draw(seed), base = pick(n, [2, 5, 10, 20, 30]), delta = pick(n, [0.5, 1, 2]);
    return { parameters: { base, delta }, prompt: `Базовая конверсия ${base}%, хотим обнаружить абсолютный прирост ${delta} п.п. при α = 0.05 и мощности 80%. По правилу Лера n = 16·p(1−p)/δ². Сколько пользователей нужно в каждую группу (округлите вверх)?`, value: Math.ceil(16 * base * (100 - base) / (delta * delta)) };
  }),
  family('live-nps', 'NPS', 'data_reasoning', -0.5, ['analyst'], seed => {
    const n = draw(seed), promoters = n(10, 300), passives = n(10, 300), detractors = n(10, 300);
    return { parameters: { promoters, passives, detractors }, prompt: `Опрос NPS: оценки 9–10 поставили ${promoters} человек, 7–8 — ${passives}, 0–6 — ${detractors}. Чему равен NPS? Округлите до двух знаков.`, value: 100 * (promoters - detractors) / (promoters + passives + detractors), tolerance: R2 };
  }),
  family('live-arppu', 'ARPU и ARPPU', 'data_reasoning', -0.7, ['analyst'], seed => {
    const n = draw(seed), users = n(1000, 100000), paying = n(10, Math.floor(users / 10)), revenue = n(10000, 5000000), perPaying = n(0, 1);
    return { parameters: { users, paying, revenue, perPaying }, prompt: `За месяц: ${users} активных пользователей, из них ${paying} платящих, выручка ${revenue} ₽. Чему равен ${perPaying ? 'ARPPU' : 'ARPU'} в рублях? Округлите до двух знаков.`, value: revenue / (perPaying ? paying : users), tolerance: R2 };
  }),
  family('live-ltv-simple', 'LTV при постоянном оттоке', 'data_reasoning', 0.3, ['analyst'], seed => {
    const n = draw(seed), arpu = n(100, 2000), margin = n(20, 80), churn = pick(n, [2, 4, 5, 8, 10, 20, 25]);
    return { parameters: { arpu, margin, churn }, prompt: `ARPU ${arpu} ₽ в месяц, маржинальность ${margin}%, месячный отток ${churn}% (постоянный). Оцените LTV как маржинальный доход за месяц, делённый на долю оттока. Ответ в рублях, округлите до двух знаков.`, value: arpu * margin / churn, tolerance: R2 };
  }),
  family('live-cac-payback', 'Окупаемость CAC', 'data_reasoning', 0.5, ['analyst'], seed => {
    const n = draw(seed), cac = n(500, 20000), arpu = n(100, 2000), margin = n(20, 80);
    return { parameters: { cac, arpu, margin }, prompt: `CAC ${cac} ₽, ARPU ${arpu} ₽ в месяц, маржинальность ${margin}%, оттоком пренебречь. За сколько полных месяцев окупится привлечение (округлите вверх)?`, value: Math.ceil(cac * 100 / (arpu * margin)) };
  }),
  family('live-stickiness', 'DAU/MAU', 'data_reasoning', -1.1, ['analyst'], seed => {
    const n = draw(seed), mau = n(10000, 500000), dau = n(Math.ceil(mau * 0.05), Math.floor(mau * 0.6));
    return { parameters: { mau, dau }, prompt: `DAU ${dau}, MAU ${mau}. Чему равен stickiness (DAU/MAU) в %? Округлите до двух знаков.`, value: 100 * dau / mau, tolerance: R2 };
  }, ['bi']),
  family('live-cagr', 'Среднегодовой рост', 'data_reasoning', 1.2, ['analyst'], seed => {
    const n = draw(seed), start = n(100, 5000), years = n(2, 6), end = n(Math.ceil(start * 1.1), start * 5);
    return { parameters: { start, years, end }, prompt: `Выручка выросла с ${start} до ${end} млн ₽ за ${years} лет. Каков среднегодовой темп роста (CAGR) в %? Округлите до двух знаков.`, value: 100 * ((end / start) ** (1 / years) - 1), tolerance: R2 };
  }),
  family('live-sql-count-variants', 'COUNT(*) и COUNT(DISTINCT)', 'databases', -0.3, ['analyst', 'backend', 'data_ml'], seed => {
    const n = draw(seed), users = n(10, 500), nulls = n(1, 50), rows = users + nulls + n(0, 1000), kind = n(0, 2);
    return { parameters: { users, nulls, rows, kind }, prompt: `В events ${rows} строк: в ${nulls} из них user_id IS NULL, остальные принадлежат ${users} разным пользователям. Что вернёт SELECT ${['COUNT(*)', 'COUNT(user_id)', 'COUNT(DISTINCT user_id)'][kind]} FROM events?`, value: [rows, rows - nulls, users][kind] };
  }, ['sql']),
  family('live-sql-rank', 'RANK и DENSE_RANK', 'databases', 1.1, ['analyst', 'data_ml', 'backend'], seed => {
    const n = draw(seed), count = n(7, 10), scores = Array.from({ length: count }, () => n(1, 6) * 10), dense = n(0, 1), target = scores[n(0, count - 1)];
    const higher = dense ? new Set(scores.filter(s => s > target)).size : scores.filter(s => s > target).length;
    return { parameters: { count, dense, target }, prompt: `Баллы игроков: ${scores.join(', ')}. ${dense ? 'DENSE_RANK' : 'RANK'}() OVER (ORDER BY score DESC). Какое значение получит игрок с баллом ${target}?`, value: higher + 1 };
  }, ['sql']),
  family('live-churn-survival', 'Остаток базы при оттоке', 'data_reasoning', 0.8, ['analyst'], seed => {
    const n = draw(seed), base = n(1000, 50000), churn = pick(n, [2, 3, 5, 8, 10, 15]), months = n(2, 12);
    return { parameters: { base, churn, months }, prompt: `${base} подписчиков, отток постоянный — ${churn}% в месяц от текущей базы, новых нет. Сколько подписчиков останется через ${months} мес.? Округлите до двух знаков.`, value: base * (1 - churn / 100) ** months, tolerance: R2 };
  }),
  family('live-ci-proportion', 'Доверительный интервал доли', 'data_reasoning', 1.6, ['analyst', 'data_ml'], seed => {
    const n = draw(seed), total = pick(n, [400, 1000, 2500, 10000]), converted = n(Math.ceil(total * 0.02), Math.floor(total * 0.5)), p = converted / total;
    return { parameters: { total, converted }, prompt: `Из ${total} пользователей конвертировались ${converted}. Какова половина ширины 95% доверительного интервала для конверсии в п.п. (нормальное приближение, z = 1.96)? Округлите до двух знаков.`, value: 100 * 1.96 * Math.sqrt(p * (1 - p) / total), tolerance: R2 };
  }),
  family('live-std-population', 'Стандартное отклонение', 'data_reasoning', 0.3, ['analyst', 'data_ml'], seed => {
    const n = draw(seed), count = n(5, 7), values = Array.from({ length: count }, () => n(1, 30)), mean = values.reduce((a, b) => a + b, 0) / count;
    return { parameters: { count }, prompt: `Значения: ${values.join(', ')}. Чему равно стандартное отклонение генеральной совокупности (деление на N)? Округлите до двух знаков.`, value: Math.sqrt(values.reduce((a, v) => a + (v - mean) ** 2, 0) / count), tolerance: R2 };
  }),
  family('live-srm-chi2', 'Проверка SRM', 'data_reasoning', 1.8, ['analyst', 'data_ml'], seed => {
    const n = draw(seed), total = n(1000, 10000) * 2, groupA = total / 2 + n(-150, 150), groupB = total - groupA, expected = total / 2;
    return { parameters: { groupA, groupB }, prompt: `Трафик должен делиться 50/50. В группу A попало ${groupA} пользователей, в B — ${groupB}. Чему равна статистика χ² Пирсона для проверки SRM? Округлите до двух знаков.`, value: ((groupA - expected) ** 2 + (groupB - expected) ** 2) / expected, tolerance: R2 };
  }),
  family('live-roi', 'ROI кампании', 'data_reasoning', -1, ['analyst'], seed => {
    const n = draw(seed), cost = n(10, 500) * 1000, profit = n(0, 1500) * 1000;
    return { parameters: { cost, profit }, prompt: `На кампанию потратили ${cost} ₽, она принесла ${profit} ₽ валовой прибыли. Каков ROI в % (прибыль минус затраты, делённое на затраты)? Округлите до двух знаков.`, value: 100 * (profit - cost) / cost, tolerance: R2 };
  }),
  family('live-incremental-orders', 'Инкрементальные заказы', 'data_reasoning', 0.1, ['analyst'], seed => {
    const n = draw(seed), treated = n(1000, 50000), control = n(10, 80), test = control + n(1, 30);
    return { parameters: { treated, control, test }, prompt: `Push-рассылку получили ${treated} пользователей, их конверсия ${test / 10}%; в сопоставимой контрольной группе конверсия ${control / 10}%. Сколько дополнительных заказов принесла рассылка? Округлите до двух знаков.`, value: treated * (test - control) / 1000, tolerance: R2 };
  }),
  family('live-moving-average', 'Скользящее среднее', 'data_reasoning', -1.8, ['analyst'], seed => {
    const n = draw(seed), values = Array.from({ length: 7 }, () => n(50, 500));
    return { parameters: { last: values[6] }, prompt: `Заказы по дням: ${values.join(', ')}. Чему равно скользящее среднее за 3 дня на последний день? Округлите до двух знаков.`, value: (values[4] + values[5] + values[6]) / 3, tolerance: R2 };
  }, ['bi']),
];

export function instantiate(family: LiveFamily, seed: number, id: string, index: number) {
  if (!Number.isInteger(seed) || !Number.isInteger(index) || index < 1) throw new RangeError('Invalid instance parameters');
  const variant = family.generate(seed);
  const ordered = [...LIVE_BANK].sort((a, b) => a.b - b.b || a.id.localeCompare(b.id));
  if (!ordered.some(f => f.id === family.id)) throw new RangeError('Unknown live family');
  const difficulty = Math.min(5, 1 + Math.floor(ordered.findIndex(f => f.id === family.id) / ordered.length * 5));
  const publicItem: TestItem = { instance_id: id, index, block: 'adaptive', type: 'short_answer',
    competency: { id: family.competency, name: ({ databases: 'Базы данных', systems: 'Системы и инфраструктура', quality: 'Качество и тестирование', data_reasoning: 'Работа с данными', algorithms: 'Алгоритмы', interface: 'Интерфейсы' } as Record<string, string>)[family.competency] ?? family.competency }, difficulty_level: difficulty,
    title: family.title, prompt: variant.prompt, code: null, options: null, answer_language: null, starter_code: null, max_length: 100, public_tests: null };
  let expectedAnswer: ExpectedAnswer;
  if (variant.options) {
    if (variant.options.length < 2 || new Set(variant.options.map(o => o.id)).size !== variant.options.length
      || new Set(variant.options.map(o => o.text.trim())).size !== variant.options.length || variant.options.some(o => !o.text.trim())
      || !variant.correctIds.length || new Set(variant.correctIds).size !== variant.correctIds.length
      || variant.correctIds.some(id => !variant.options.some(o => o.id === id))
      || (variant.type === 'single_choice' && variant.correctIds.length !== 1)) throw new Error('Invalid choice family');
    const random = seededRandom(seed ^ 0x5f3759df), options = [...variant.options];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [options[i], options[j]] = [options[j]!, options[i]!];
    }
    publicItem.type = variant.type;
    publicItem.max_length = null;
    publicItem.options = options.map((o, i) => ({ id: `o${i + 1}`, text: o.text }));
    expectedAnswer = { kind: 'options', ids: options.flatMap((o, i) => variant.correctIds.includes(o.id) ? [`o${i + 1}`] : []) };
  } else {
    expectedAnswer = { kind: 'numeric', value: variant.value, absoluteTolerance: variant.tolerance ?? 0, relativeTolerance: 0 };
  }
  return { familyId: family.id, templateVersion: family.templateVersion, parameters: { seed, ...variant.parameters }, publicItem, expectedAnswer, discrimination: family.a, difficulty: family.b };
}

export function requiredCompetencies(bank: readonly LiveFamily[], maxExposure: number): string[] {
  if (!Number.isFinite(maxExposure) || maxExposure <= 0 || maxExposure > 1) throw new RangeError('Invalid exposure ceiling');
  const counts = new Map<string, number>();
  for (const f of bank) counts.set(f.competency, (counts.get(f.competency) ?? 0) + 1);
  return [...counts].filter(([, n]) => n >= Math.ceil(1 / maxExposure)).map(([id]) => id).sort();
}
/** Necessary inventory bound only: it does not prove content balance or measured exposure. */
export function bankInventory(specialization: Specialization, maxItems: number, exposureCeiling: number) {
  if (!Number.isInteger(maxItems) || maxItems < 1 || !Number.isFinite(exposureCeiling) || exposureCeiling <= 0 || exposureCeiling > 1) throw new RangeError('Invalid bank policy');
  const available = LIVE_BANK.filter(f => f.specializations.includes(specialization));
  const required = Math.ceil(maxItems / exposureCeiling);
  return { available: available.length, required, deficit: Math.max(0, required - available.length), sufficientInventory: available.length >= required };
}
