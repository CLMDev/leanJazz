import time
import re

def getPatternName():
    pattern_json_path=os.getcwd()+"/VSP/patterns.json"
    f = open (pattern_json_path, "r")
    for line in f:
       if "name" in line:
          break

    print "line:" + line
    match = re.search(":( *)\"(.*)\",", line)
    f.close()
    return  match.group(2).strip()



def shouldDeployVSP():
    """
    test if we would deploy the VSP
    to determine the behavior based on the property value in the proprty file
    """
    f = open("pyautomation.properties", "r")
    for line in f:
        if "deployment.pattern" in line:
            print "line:" + line
            match = re.search(r"(.*)=(.*)", line)
            try:
                if  match.group(2).strip() == "True":
                    return True
            except:
                pass
            return False

    f.close()
    return False

def  getjo():
    """
    get variables names and values dynamically
    from # Start VSP params to # Start VSP params in pyautomation.properties.
    """
    dict = {}
    f = open("pyautomation.properties", "r")
    found = False
    profile = None
    cloud = None
    for line in f:
        if "envprofile.name1" in line:
            print "line:" + line
            match = re.search(r"(.*)=(.*)", line)
            try:
                pname = match.group(2).strip()
                profile = deployer.environmentprofiles.list({'name':pname})[0]
                #dict['environmentprofile'] = profile
                dict['pname']=pname
            except:
                pass
            continue
        if "cloud1.name" in line:
            print "line:" + line
            match = re.search(r"(.*)=(.*)", line)
            try:
                cname = match.group(2).strip()
                #cloud = deployer.clouds.list({'name':cname})[0]
                print 'cloud name:' + cname
                #dict['*.cloud'] = cloud
                dict['cname']=cname
            except:
                pass
            continue
        if "vs.endtime" in line:
            print "line:" + line
            match = re.search(r"(.*)=(.*)", line)
            try:
                dict['endtime'] = time.time()+ long(match.group(2).strip())
            except:
                pass
            continue
        if "# Start VSP params" in line:
            found = True
            continue
        if "# End VSP params" in line:
            break
        if found:
            print "line:" + line
            match = re.search(r"(.*)=(.*)", line)
            try:
                dict[match.group(1).strip()] = match.group(2).strip()
            except:
                pass
    return dict
    f.close()

def ImportDeployVSP():
    cwd=os.getcwd()
    pattern=None
    try:
      pattern=deployer.patterns.load(cwd +"/VSP")
    except Exception,e:
      print e
      assert True , 'pattern loading errors'
      pass
    if shouldDeployVSP() == False:
      exit ( 0 )
    pattern_name=getPatternName()
    found=False
    for p in deployer.patterns.list():
      if pattern_name.lower() in p.name.lower():
        found=True
        break
    if found == False:
      print "pattern:" + pattern_name + " not found!"
      exit (1)
    createParms = getjo()
    pname=createParms['pname']
    cname=createParms['cname']
    cloud = deployer.clouds.list({'name':cname})[0]
    print 'cloud to be deployed:', cloud
    createParms['cloud'] = cloud
    createParms['pattern'] = p
    ts=time.time()
    import datetime
    st=datetime.datetime.fromtimestamp(ts).strftime("%Y%m%d%H%M")
    createParms['name'] = "test_"+p.name + st 
    createParms['starttime'] = time.time()
    createParms['*.ConfigPWD_ROOT.password']='ec11ipse'
    createParms['*.ConfigPWD_USER.password']='ec11ipse'
    try:
        virtualSystem = deployer.virtualsystems << createParms
        print 'virtual system created:\n%s' % virtualSystem
    except ValueError, ve:
        print str(ve)

ImportDeployVSP()
