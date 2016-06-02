# CDC Emulator (CD Changer)

import os, sys, time, signal, json, logging, traceback
import threading


WRITER = None
STATE_DATA = {}
FUNC_STACK = {}


# Set the WRITER object (the iBus interface class) to an instance passed in from the CORE module
def init(writer):
  global WRITER  
  logging.info("Initializing CDC Emulator")
  WRITER = writer

def shutDown():
  global WRITER
  logging.info("Shutting down CDC emulator")
  WRITER = None

def enableFunc(funcName, interval, count=0):
  global FUNC_STACK

  # Cancel Thread if it already exists.
  if FUNC_STACK.get(funcName) and FUNC_STACK.get(funcName).get("THREAD"):
    FUNC_STACK[funcName]["THREAD"].cancel()
  
  # Dont worry about checking if a function is already enabled, as the thread would have died. Rather than updating the spec, just run a new thread.
  if getattr(sys.modules[__name__], funcName):
    FUNC_STACK[funcName] = {
      "COUNT": count,
      "INTERVAL": interval,
      "THREAD": threading.Timer(
        interval,
        revive, [funcName]
      )
    }
    logging.debug("Enabling New Thread:\n%s %s" % (funcName, FUNC_STACK[funcName]))
    worker_func = getattr(sys.modules[__name__], funcName)
    worker_func()
    FUNC_STACK[funcName]["THREAD"].start()
  else:
    logging.warning("No function found (%s)" % funcName)

def disableFunc(funcName):
  global FUNC_STACK
  if funcName in FUNC_STACK.keys():
    thread = FUNC_STACK[funcName].get("THREAD")
    if thread: thread.cancel()
    del FUNC_STACK[funcName]

def disableAllFunc():
  global FUNC_STACK
  for funcName in FUNC_STACK:
    thread = FUNC_STACK[funcName].get("THREAD")
    if thread: thread.cancel()
  FUNC_STACK = {}

def revive(funcName):
  global FUNC_STACK
  funcSpec = FUNC_STACK.get(funcName, None)
  if funcSpec:
    count = funcSpec["COUNT"]
    if count != 1:
      FUNC_STACK[funcName]["COUNT"] = count - 1
      funcSpec["THREAD"].cancel() # Kill off this thread just in case..
      enableFunc(funcName, funcSpec["INTERVAL"]) # REVIVE!

def pollResponse():
  WRITER.writeBusPacket('18', 'FF', ['02','00'])

def announce():
  WRITER.writeBusPacket('18', 'FF', ['02', '01'])