from pathlib import Path

p = Path(r"C:\Users\Никита\OneDrive\Рабочий стол\ТЕСТ кафетерий\lib\seed.ts")
t = p.read_text(encoding="utf-8")
t = t.replace(
    """      onboardingDone: false,
      needsQuizDone: false,
      flexibleSchedule: false,
      burnable: 5000,""",
    """      onboardingDone: false,
      needsQuizDone: false,
      dmsProgramId: null,
      dmsStatus: "none",
      dmsExpiresAt: null,
      burnNoticesSent: 0,
      flexibleSchedule: false,
      burnable: 5000,""",
)
t = t.replace(
    """      durable: 3200,
      frozen: false,
      city: "Челябинск",
      email: "anton.rybakov@altair.demo",""",
    """      durable: 3200,
      frozen: false,
      exclusion: true,
      city: "Челябинск",
      email: "anton.rybakov@altair.demo",""",
)
t = t.replace(
    """      id: "nina",
      name: "Нина Белова",
      role: "employee",
      title: "Бухгалтер",
      department: "Финансы",
      grade: "B",
      years: 5,
      managerId: "anna",
      onboardingDone: true,
      needsQuizDone: true,
      dmsProgramId: null,
      dmsStatus: "none",
      dmsExpiresAt: null,""",
    """      id: "nina",
      name: "Нина Белова",
      role: "employee",
      title: "Бухгалтер",
      department: "Финансы",
      grade: "B",
      years: 5,
      managerId: "anna",
      onboardingDone: true,
      needsQuizDone: true,
      dmsProgramId: "prog-std",
      dmsStatus: "active",
      dmsExpiresAt: "2027-09-30",""",
)
p.write_text(t, encoding="utf-8")
print("exclusion", t.count("exclusion: true"), "nina", t.count("prog-std"))
