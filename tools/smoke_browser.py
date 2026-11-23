from playwright.sync_api import sync_playwright
from pathlib import Path
from PIL import Image
out=Path('/mnt/data/mikrolab/screenshots');out.mkdir(exist_ok=True)
with sync_playwright() as pw:
  b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--allow-file-access-from-files'])
  p=b.new_page(viewport={'width':1440,'height':960},device_scale_factor=1)
  errors=[];p.on('pageerror',lambda err:errors.append(str(err)))
  p.goto('file:///mnt/data/mikrolab/dist/index.html',wait_until='load',timeout=18000)
  p.screenshot(path=str(out/'dashboard.png'),full_page=True)
  print('title:',p.title(),'body length',len(p.locator('body').inner_text()),'errors',errors[:3]);print('heading:',p.locator('h1').first.inner_text())
  p.get_by_role('button',name='Kapitoly').click();print('topics:',p.locator('.topic-card').count());p.screenshot(path=str(out/'topics.png'),full_page=True)
  p.locator('.open-topic').first.click();print('lesson:',p.locator('h1').first.inner_text());p.screenshot(path=str(out/'lesson.png'),full_page=True)
  p.get_by_role('button',name='Procvičit otázky').click();print('quiz shown:',p.locator('.option').count());p.locator('.option').first.click();print('feedback:',p.locator('.feedback').count());p.screenshot(path=str(out/'quiz.png'),full_page=True)
  p.get_by_role('button',name='Ukončit procvičování').click()
  p.get_by_role('button',name='Opakování').click();p.locator('[data-action="start-review"]').first.click();print('review:',p.locator('.flashcard').count());p.get_by_role('button',name='Ukázat odpověď').click();p.locator('[data-action="rate"]').nth(2).click();print('rated one card')
  p.get_by_role('button',name='Nastavení').click();p.screenshot(path=str(out/'settings.png'),full_page=True)
  print('all errors',errors)
  b.close()
