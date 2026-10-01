from pathlib import Path
import re

p = Path(r"C:\Users\Никита\OneDrive\Рабочий стол\ТЕСТ кафетерий\lib\seed.ts")
t = p.read_text(encoding="utf-8")

def repl(m: re.Match[str]) -> str:
    val = m.group(1)
    quiz = "false" if val == "false" else "true"
    indent = m.group(0).split("onboardingDone")[0]
    return f"{indent}onboardingDone: {val},\n{indent}needsQuizDone: {quiz},"

t2, n = re.subn(
    r"^([ \t]*)onboardingDone: (true|false),(?!\n[ \t]*needsQuizDone)",
    lambda m: f"{m.group(1)}onboardingDone: {m.group(2)},\n{m.group(1)}needsQuizDone: {'false' if m.group(2) == 'false' else 'true'},",
    t,
    flags=re.M,
)
p.write_text(t2, encoding="utf-8")
print("replacements", n, "total needsQuizDone", t2.count("needsQuizDone"))
