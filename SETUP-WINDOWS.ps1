$ErrorActionPreference = "Stop"

# Garante caracteres acentuados corretos no terminal do Windows.
chcp 65001 > $null
[Console]::InputEncoding = [System.Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)

function Invoke-Step {
  param(
    [Parameter(Mandatory = $true)][string]$Title,
    [Parameter(Mandatory = $true)][scriptblock]$Command
  )

  Write-Host $Title -ForegroundColor Yellow
  & $Command

  if ($LASTEXITCODE -ne 0) {
    throw "A etapa falhou: $Title (código $LASTEXITCODE)."
  }
}

Write-Host "RodriGol 2.0 - instalação da Foundation 01" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js não foi encontrado. Instale o Node.js 20 ou superior antes de continuar."
}

$nodeMajor = [int]((node --version).TrimStart('v').Split('.')[0])
if ($nodeMajor -lt 20) {
  throw "Versão incompatível do Node.js. É necessário usar Node.js 20 ou superior."
}

Invoke-Step "Instalando dependências..." { npm install }
Invoke-Step "Verificando o TypeScript..." { npm run check }
Invoke-Step "Executando testes..." { npm test }
Invoke-Step "Compilando o projeto..." { npm run build }

Write-Host "`nFoundation 01 concluída com sucesso." -ForegroundColor Green
